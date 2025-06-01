import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { VocabularyList } from "../entity/VocabularyList.js";
import { VocabularyItem } from "../entity/VocabularyItem.js";

const router: Router = Router();
const vocabularyListRepo = AppDataSource.getRepository(VocabularyList);
const vocabularyItemRepo = AppDataSource.getRepository(VocabularyItem);

// GET: Retrieve vocabulary list for a video
router.get("/:videoId", async (req: Request, res: Response) => {
  const { videoId } = req.params;
  try {
    const vocabList = await vocabularyListRepo.findOne({
      where: { videoId },
      relations: ["items"],
    });
    if (!vocabList) {
      return res.status(404).json({ error: "Vocabulary list not found for this video." });
    }
    res.json(vocabList);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST: Create a new vocabulary list
router.post("/", async (req: Request, res: Response) => {
  const { videoId, items } = req.body;
  if (!videoId || !Array.isArray(items)) {
    return res.status(400).json({ error: "videoId and items are required." });
  }
  try {
    // Prevent duplicate lists for the same video
    const existing = await vocabularyListRepo.findOne({ where: { videoId } });
    if (existing) {
      return res.status(409).json({ error: "Vocabulary list already exists for this video." });
    }
    const vocabList = new VocabularyList();
    vocabList.videoId = videoId;
    vocabList.items = items.map((item: any) => {
      const vocabItem = new VocabularyItem();
      vocabItem.text = item.text;
      vocabItem.pinyin = item.pinyin;
      vocabItem.translation = item.translation;
      vocabItem.examples = item.examples || [];
      vocabItem.audioUrl = item.audioUrl;
      return vocabItem;
    });
    await vocabularyListRepo.save(vocabList);
    res.status(201).json(vocabList);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH: Update an existing vocabulary list (replace items)
router.patch("/:videoId", async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items array is required." });
  }
  try {
    const vocabList = await vocabularyListRepo.findOne({ where: { videoId }, relations: ["items"] });
    if (!vocabList) {
      return res.status(404).json({ error: "Vocabulary list not found for this video." });
    }
    // Remove old items
    await vocabularyItemRepo.delete({ vocabularyList: { id: vocabList.id } });
    // Add new items
    vocabList.items = items.map((item: any) => {
      const vocabItem = new VocabularyItem();
      vocabItem.text = item.text;
      vocabItem.pinyin = item.pinyin;
      vocabItem.translation = item.translation;
      vocabItem.examples = item.examples || [];
      vocabItem.audioUrl = item.audioUrl;
      return vocabItem;
    });
    await vocabularyListRepo.save(vocabList);
    res.json(vocabList);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
