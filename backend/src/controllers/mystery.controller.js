import * as mysteryService from "../services/mystery.service.js";

export async function unlock(req, res) {
  const data = await mysteryService.unlockMysteryFile(req.user.userId);
  res.status(200).json({ data });
}

export async function history(req, res) {
  const data = await mysteryService.getDownloadHistory(req.user.userId);
  res.status(200).json({ data });
}

export async function dailyReward(req, res) {
  const data = await mysteryService.getDailyMysteryReward(req.user.userId);
  res.status(200).json({ data });
}
