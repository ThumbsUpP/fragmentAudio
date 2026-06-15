# Plan: Import YouTube Async Dans L’API Node

  ## Summary

  Ajouter POST /api/videos/import/youtube comme import asynchrone DB-backed, sans logique YouTube dans stable-ts. Le job parent YOUTUBE_IMPORT représente le workflow global jusqu’à la fin de
  l’alignement; le job enfant ALIGNMENT reste créé par le flux audio+SRT existant. Les fichiers temporaires produits par YouTube sont un audio.wav mono 16 kHz et un .srt, puis le flux stable-ts
  générique est réutilisé.

  ## Key Changes

  - Étendre processing_jobs avec kind, parent_job_id, payload JSONB; synchroniser SQL init, Prisma schema, repository/types, et affichage admin si nécessaire.
  - Ajouter une queue DB minimale pour YOUTUBE_IMPORT :
      - endpoint crée un job PENDING / QUEUED et retourne 202 { jobId, status: "PENDING" }
      - worker démarré dans server.ts
      - acquisition via transaction FOR UPDATE SKIP LOCKED
      - concurrence par défaut 1, pas de retry automatique

  - Ajouter config env :
      - YTDLP_BIN=yt-dlp
      - FFMPEG_BIN=ffmpeg
      - YOUTUBE_IMPORT_DIR=.uploads/youtube
      - YOUTUBE_IMPORT_POLL_INTERVAL_MS=2000
      - YOUTUBE_IMPORT_CONCURRENCY=1
      - YOUTUBE_COMMAND_TIMEOUT_MS avec défaut raisonnable
      - YOUTUBE_MAX_DURATION_SECONDS optionnel, non appliqué si absent

  ## Import Behavior

  - Body YouTube :

    {
      "url": "https://www.youtube.com/watch?v=...",
      "sourceLanguage": "zh",
      "subtitleLanguage": "zh",
      "overwrite": false
    }

  - Validation synchrone avant création du job : body objet, URL YouTube supportée, langues non vides, overwrite boolean strict si présent.
  - Payload stocké : uniquement url, sourceLanguage, subtitleLanguage, overwrite.
  - Worker :
      - lit metadata avec yt-dlp --dump-single-json --skip-download
      - extrait videoId, title, duration
      - applique YOUTUBE_MAX_DURATION_SECONDS si configuré
      - sélectionne les sous-titres en préférant manuel à auto
      - pour zh, fallback exact puis zh-*; pour une locale précise, exact seulement
      - télécharge audio et sous-titres dans un workdir unique
      - normalise audio avec ffmpeg en audio.wav mono 16 kHz

  - yt-dlp/ffmpeg doivent être lancés via spawn/execFile avec tableaux d’arguments, sans concaténation shell, avec timeout.

  ## Overwrite Semantics

  - Exposer overwrite aussi sur /api/videos/import multipart.
  - Multipart parsing : accepter seulement true/false/1/0; absent = false.
  - overwrite=true crée si absent.
  - Si une vidéo existe déjà avec le même externalId, conserver le même video.id.
  - L’ancienne vidéo reste intacte jusqu’à réussite stable-ts.
  - Après réussite stable-ts, remplacer en transaction :
      - mettre à jour title, sourceUrl, sourceLanguage, updated_at
      - supprimer les traductions directes vidéo
      - supprimer les anciens alignements, ce qui cascade segments/words/translations/grammar
      - insérer le nouvel alignment/segments/words

  - Si stable-ts échoue, l’ancienne vidéo et ses données restent intactes.

  ## Service Refactor

  - Découper VideoService.importAudioAndSrt(...) pour séparer :
      - appel stable-ts audio+SRT
      - persistance DB du résultat
      - cleanup fichiers

  - Ajouter support :
      - parentJobId?: string
      - overwrite?: boolean
      - création stricte par défaut
      - job enfant ALIGNMENT lié au parent si fourni

  - Le job parent YouTube est mis à jour :
      - PROCESSING / FETCHING_METADATA
      - PROCESSING / DOWNLOADING_AUDIO
      - PROCESSING / DOWNLOADING_SUBTITLES
      - PROCESSING / ALIGNMENT_RUNNING
      - COMPLETED / DONE avec video_id
      - ou FAILED / FAILED avec erreur claire

  ## Error Handling And Cleanup

  - POST /youtube ne retourne que les erreurs de validation initiale; erreurs runtime visibles via GET /api/jobs/:jobId.
  - URL invalide : 400.
  - Sous-titres absents : job parent FAILED avec message clair.
  - yt-dlp ou ffmpeg manquant/échec : job parent FAILED avec message clair.
  - Créer un workdir unique par import; éviter les filenames utilisateur.
  - Nettoyer tout le workdir en succès et échec, pas seulement audioPath/srtPath.

  ## Tests

  - Ajouter un runner de tests côté apps/api si nécessaire, avec tests unitaires focalisés.
  - Couvrir :
      - validation URL YouTube
      - parsing strict du body YouTube et du booléen multipart
      - parsing metadata yt-dlp
      - sélection des sous-titres manuel/auto et fallback zh
      - délégation à importAudioAndSrt(...) avec externalId, title, sourceUrl, langues, overwrite, parentJobId
      - acquisition DB queue avec kind = YOUTUBE_IMPORT
      - cleanup workdir en succès et échec
      - overwrite : conservation du video.id, suppression des anciennes données seulement après réussite stable-ts

  - Vérification finale : pnpm --filter api type-check et tests API.