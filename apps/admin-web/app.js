const API_URL_STORAGE_KEY = "fragmentAudio.admin.apiUrl";

const defaultApiUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:4000`;
};

const storedApiUrl = localStorage.getItem(API_URL_STORAGE_KEY);
const initialApiUrl =
  storedApiUrl && !(storedApiUrl.includes("localhost") && window.location.hostname !== "localhost")
    ? storedApiUrl
    : defaultApiUrl();

const state = {
  apiUrl: initialApiUrl,
  videos: [],
  jobs: [],
  selectedVideoId: null,
  selectedTab: "overview",
  filter: "",
};

const elements = {
  apiForm: document.querySelector("#api-form"),
  apiUrl: document.querySelector("#api-url"),
  refreshButton: document.querySelector("#refresh-button"),
  jobsRefreshButton: document.querySelector("#jobs-refresh-button"),
  newVideoButton: document.querySelector("#new-video-button"),
  importButton: document.querySelector("#import-button"),
  filterInput: document.querySelector("#filter-input"),
  videoList: document.querySelector("#video-list"),
  jobsList: document.querySelector("#jobs-list"),
  detailPane: document.querySelector("#detail-pane"),
  videoDialog: document.querySelector("#video-dialog"),
  videoForm: document.querySelector("#video-form"),
  importDialog: document.querySelector("#import-dialog"),
  importForm: document.querySelector("#import-form"),
  translationDialog: document.querySelector("#translation-dialog"),
  translationForm: document.querySelector("#translation-form"),
  translationTitle: document.querySelector("#translation-title"),
  toast: document.querySelector("#toast"),
};

elements.apiUrl.value = state.apiUrl;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatTime = (value) => `${Number(value ?? 0).toFixed(2)}s`;

const badgeClass = (status) => {
  if (!status) {
    return "";
  }
  if (status === "COMPLETED") {
    return "good";
  }
  if (status === "FAILED") {
    return "bad";
  }
  return "warn";
};

const showToast = (message, type = "info") => {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type === "error" ? "error" : ""}`;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 4500);
};

const request = async (path, options = {}) => {
  const response = await fetch(`${state.apiUrl}${path}`, options);
  const text = await response.text();
  const payload = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { error: text };
        }
      })()
    : null;

  if (!response.ok) {
    const errorMessage =
      typeof payload?.error === "string"
        ? payload.error
        : payload?.error?.message || payload?.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload;
};

const getFormValue = (form, name) => {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : value;
};

const renderVideos = () => {
  const query = state.filter.toLowerCase();
  const videos = state.videos.filter((video) => {
    const haystack = `${video.title} ${video.externalId} ${video.sourceLanguage} ${video.id}`.toLowerCase();
    return haystack.includes(query);
  });

  if (videos.length === 0) {
    elements.videoList.innerHTML = `
      <div class="empty-state">
        <h2>Aucun contenu</h2>
        <p>La base ne contient pas encore de video correspondant au filtre.</p>
      </div>
    `;
    return;
  }

  elements.videoList.innerHTML = videos
    .map(
      (video) => `
        <button class="video-card ${video.id === state.selectedVideoId ? "active" : ""}" type="button" data-video-id="${escapeHtml(video.id)}">
          <strong>${escapeHtml(video.title)}</strong>
          <span class="meta">${escapeHtml(video.externalId)} · ${escapeHtml(video.sourceLanguage)} · ${formatDate(video.createdAt)}</span>
          <span class="tags">
            <span class="tag ${badgeClass(video.latestJobStatus)}">${escapeHtml(video.latestJobStatus || "NO_JOB")}</span>
            <span class="tag">${video.segmentCount} segments</span>
            <span class="tag">${video.alignmentCount} alignements</span>
          </span>
        </button>
      `
    )
    .join("");
};

const renderJobs = () => {
  if (state.jobs.length === 0) {
    elements.jobsList.innerHTML = `<div class="job-row"><span class="meta">Aucun job</span></div>`;
    return;
  }

  elements.jobsList.innerHTML = state.jobs
    .slice(0, 8)
    .map(
      (job) => `
        <div class="job-row">
          <strong>${escapeHtml(job.id)}</strong>
          <span class="tags">
            <span class="tag ${badgeClass(job.status)}">${escapeHtml(job.status)}</span>
            <span class="tag">${escapeHtml(job.step || "-")}</span>
          </span>
          <span class="meta">${formatDate(job.updatedAt)}</span>
        </div>
      `
    )
    .join("");
};

const loadVideos = async () => {
  const result = await request("/api/videos?limit=100&offset=0");
  state.videos = result.items || [];
  if (!state.selectedVideoId && state.videos[0]) {
    state.selectedVideoId = state.videos[0].id;
  }
  renderVideos();
};

const loadJobs = async () => {
  const result = await request("/api/jobs?limit=20&offset=0");
  state.jobs = result.items || [];
  renderJobs();
};

const currentVideo = () => state.videos.find((video) => video.id === state.selectedVideoId);

const detailLoading = () => {
  elements.detailPane.innerHTML = `
    <div class="loading-state">
      <h2>Chargement</h2>
      <p>Lecture des donnees depuis l'API.</p>
    </div>
  `;
};

const renderDetailShell = (video, body) => {
  const tabs = [
    ["overview", "Vue"],
    ["segments", "Segments"],
    ["translations", "Traductions"],
    ["grammar", "Grammaire"],
  ];

  elements.detailPane.innerHTML = `
    <header class="detail-header">
      <div class="detail-title">
        <div>
          <p class="eyebrow">${escapeHtml(video.externalId)}</p>
          <h2>${escapeHtml(video.title)}</h2>
        </div>
        <span class="tag ${badgeClass(video.latestJobStatus)}">${escapeHtml(video.latestJobStatus || "NO_JOB")}</span>
      </div>
      <div class="meta">
        <span>ID ${escapeHtml(video.id)}</span>
        <span>Langue ${escapeHtml(video.sourceLanguage)}</span>
        <span>${video.segmentCount} segments</span>
        <span>${video.alignmentCount} alignements</span>
      </div>
      <nav class="tabs">
        ${tabs
          .map(
            ([id, label]) =>
              `<button class="tab ${state.selectedTab === id ? "active" : ""}" type="button" data-tab="${id}">${label}</button>`
          )
          .join("")}
      </nav>
    </header>
    <div class="detail-body">${body}</div>
  `;
};

const renderOverview = async (video) => {
  const rows = [
    ["Titre", video.title],
    ["External ID", video.externalId],
    ["Source", video.sourceUrl || "-"],
    ["Langue source", video.sourceLanguage],
    ["Cree le", formatDate(video.createdAt)],
    ["Mis a jour", formatDate(video.updatedAt)],
    ["Dernier alignement", video.latestAlignmentId || "-"],
  ];

  renderDetailShell(
    video,
    `
      <section class="section">
        <div class="section-header">
          <h3>Identite</h3>
          <button type="button" data-action="add-video-translation">Ajouter traduction video</button>
        </div>
        <table class="data-table">
          <tbody>
            ${rows.map(([key, value]) => `<tr><th>${key}</th><td>${escapeHtml(value)}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
    `
  );
};

const renderSegments = async (video) => {
  const result = await request(`/api/videos/${video.id}/segments?limit=100&offset=0`);
  const segments = result.items || [];
  renderDetailShell(
    video,
    `
      <section class="section">
        <div class="section-header">
          <h3>${segments.length} segments</h3>
        </div>
        <div class="segment-list">
          ${
            segments.length
              ? segments
                  .map(
                    (segment) => `
                      <article class="segment-item">
                        <div class="row">
                          <span class="tag">#${segment.index}</span>
                          <span class="meta">${formatTime(segment.start)} - ${formatTime(segment.end)}</span>
                        </div>
                        <div class="segment-text">${escapeHtml(segment.text)}</div>
                        <div class="row">
                          <button class="ghost" type="button" data-action="add-segment-translation" data-segment-id="${escapeHtml(segment.id)}">Traduire</button>
                          <button class="ghost" type="button" data-action="generate-segment-translation" data-segment-id="${escapeHtml(segment.id)}">Generer traduction</button>
                          <button class="ghost" type="button" data-action="generate-grammar" data-segment-id="${escapeHtml(segment.id)}">Generer grammaire</button>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state"><h2>Aucun segment</h2><p>L'import audio + SRT creera les segments.</p></div>`
          }
        </div>
      </section>
    `
  );
};

const renderTranslations = async (video) => {
  const result = await request(`/api/videos/${video.id}/translations`);
  const translations = result.data || [];
  renderDetailShell(
    video,
    `
      <section class="section">
        <div class="section-header">
          <h3>Traductions video</h3>
          <div class="row">
            <button class="ghost" type="button" data-action="generate-video-translation">Generer</button>
            <button type="button" data-action="add-video-translation">Ajouter</button>
          </div>
        </div>
        ${
          translations.length
            ? `<table class="data-table">
                <thead><tr><th>Langue</th><th>Texte</th><th>Provider</th><th>Date</th></tr></thead>
                <tbody>
                  ${translations
                    .map(
                      (translation) => `
                        <tr>
                          <td>${escapeHtml(translation.language)}</td>
                          <td>${escapeHtml(translation.text)}</td>
                          <td>${escapeHtml(translation.provider || "manual")}</td>
                          <td>${formatDate(translation.createdAt)}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>`
            : `<div class="empty-state"><h2>Aucune traduction</h2><p>Ajoute une traduction manuelle ou genere-la via le LLM.</p></div>`
        }
      </section>
    `
  );
};

const renderGrammar = async (video) => {
  const result = await request(`/api/videos/${video.id}/segments?limit=50&offset=0`);
  const segments = result.items || [];
  renderDetailShell(
    video,
    `
      <section class="section">
        <div class="section-header">
          <h3>Explications par segment</h3>
        </div>
        <div class="segment-list">
          ${
            segments.length
              ? segments
                  .map(
                    (segment) => `
                      <article class="segment-item">
                        <div class="row">
                          <span class="tag">#${segment.index}</span>
                          <span class="segment-text">${escapeHtml(segment.text)}</span>
                        </div>
                        <div class="row">
                          <button class="ghost" type="button" data-action="generate-grammar" data-segment-id="${escapeHtml(segment.id)}">Generer grammaire</button>
                          <button class="ghost" type="button" data-action="load-grammar" data-segment-id="${escapeHtml(segment.id)}">Afficher</button>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state"><h2>Aucun segment</h2><p>Importe un contenu aligne avant de generer la grammaire.</p></div>`
          }
        </div>
      </section>
    `
  );
};

const renderSelectedVideo = async () => {
  const video = currentVideo();
  if (!video) {
    elements.detailPane.innerHTML = `
      <div class="empty-state">
        <h2>Aucun contenu selectionne</h2>
        <p>Selectionne une video dans la liste ou cree un nouveau contenu.</p>
      </div>
    `;
    return;
  }

  detailLoading();
  const freshVideo = await request(`/api/videos/${video.id}`);
  const index = state.videos.findIndex((item) => item.id === video.id);
  if (index >= 0) {
    state.videos[index] = freshVideo;
  }

  if (state.selectedTab === "segments") {
    await renderSegments(freshVideo);
  } else if (state.selectedTab === "translations") {
    await renderTranslations(freshVideo);
  } else if (state.selectedTab === "grammar") {
    await renderGrammar(freshVideo);
  } else {
    await renderOverview(freshVideo);
  }
};

const refreshAll = async () => {
  try {
    elements.refreshButton.disabled = true;
    await Promise.all([loadVideos(), loadJobs()]);
    renderVideos();
    await renderSelectedVideo();
    showToast("Donnees actualisees");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    elements.refreshButton.disabled = false;
  }
};

const createVideo = async (form) => {
  const body = {
    title: getFormValue(form, "title"),
    externalId: getFormValue(form, "externalId"),
    sourceLanguage: getFormValue(form, "sourceLanguage") || "zh",
    sourceUrl: getFormValue(form, "sourceUrl") || undefined,
  };
  const video = await request("/api/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  state.selectedVideoId = video.id;
  state.selectedTab = "overview";
  await refreshAll();
};

const importVideo = async (form) => {
  const data = new FormData(form);
  if (!data.get("sourceUrl")) {
    data.delete("sourceUrl");
  }
  const result = await request("/api/videos/import", {
    method: "POST",
    body: data,
  });
  state.selectedVideoId = result.videoId;
  state.selectedTab = "segments";
  await refreshAll();
};

const saveTranslation = async (form) => {
  const targetType = getFormValue(form, "targetType");
  const targetId = getFormValue(form, "targetId");
  const body = {
    language: getFormValue(form, "language"),
    text: getFormValue(form, "text"),
    provider: "manual",
  };
  const path =
    targetType === "VIDEO"
      ? `/api/videos/${targetId}/translations`
      : `/api/segments/${targetId}/translations`;
  await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await renderSelectedVideo();
};

const regenerate = async (path, language = "fr") => {
  await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language }),
  });
  await refreshAll();
};

const showTranslationDialog = (targetType, targetId) => {
  elements.translationTitle.textContent = targetType === "VIDEO" ? "Traduction video" : "Traduction segment";
  elements.translationForm.reset();
  elements.translationForm.elements.targetType.value = targetType;
  elements.translationForm.elements.targetId.value = targetId;
  elements.translationForm.elements.language.value = "fr";
  elements.translationDialog.showModal();
};

elements.apiForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.apiUrl = elements.apiUrl.value.replace(/\/+$/, "");
  localStorage.setItem(API_URL_STORAGE_KEY, state.apiUrl);
  await refreshAll();
});

elements.refreshButton.addEventListener("click", refreshAll);
elements.jobsRefreshButton.addEventListener("click", async () => {
  try {
    await loadJobs();
    showToast("Jobs actualises");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.newVideoButton.addEventListener("click", () => {
  elements.videoForm.reset();
  elements.videoForm.elements.sourceLanguage.value = "zh";
  elements.videoDialog.showModal();
});

elements.importButton.addEventListener("click", () => {
  elements.importForm.reset();
  elements.importForm.elements.sourceLanguage.value = "zh";
  elements.importDialog.showModal();
});

elements.filterInput.addEventListener("input", () => {
  state.filter = elements.filterInput.value;
  renderVideos();
});

elements.videoList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-video-id]");
  if (!card) {
    return;
  }
  state.selectedVideoId = card.dataset.videoId;
  renderVideos();
  try {
    await renderSelectedVideo();
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.detailPane.addEventListener("click", async (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    state.selectedTab = tab.dataset.tab;
    try {
      await renderSelectedVideo();
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) {
    return;
  }

  const video = currentVideo();
  if (!video) {
    return;
  }

  try {
    if (action.dataset.action === "add-video-translation") {
      showTranslationDialog("VIDEO", video.id);
    } else if (action.dataset.action === "add-segment-translation") {
      showTranslationDialog("SEGMENT", action.dataset.segmentId);
    } else if (action.dataset.action === "generate-video-translation") {
      await regenerate(`/api/videos/${video.id}/translations/regenerate`);
      showToast("Traduction video generee");
    } else if (action.dataset.action === "generate-segment-translation") {
      await regenerate(`/api/segments/${action.dataset.segmentId}/translations/regenerate`);
      showToast("Traduction segment generee");
    } else if (action.dataset.action === "generate-grammar") {
      await regenerate(`/api/segments/${action.dataset.segmentId}/grammar/regenerate`);
      showToast("Grammaire generee");
    } else if (action.dataset.action === "load-grammar") {
      const explanation = await request(`/api/segments/${action.dataset.segmentId}/grammar?language=en`);
      showToast(explanation.answerMarkdown);
    }
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.videoForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value === "cancel") {
    return;
  }
  event.preventDefault();
  try {
    await createVideo(elements.videoForm);
    elements.videoDialog.close();
    showToast("Contenu cree");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.importForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value === "cancel") {
    return;
  }
  event.preventDefault();
  try {
    await importVideo(elements.importForm);
    elements.importDialog.close();
    showToast("Import termine");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.translationForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value === "cancel") {
    return;
  }
  event.preventDefault();
  try {
    await saveTranslation(elements.translationForm);
    elements.translationDialog.close();
    showToast("Traduction enregistree");
  } catch (error) {
    showToast(error.message, "error");
  }
});

refreshAll();
