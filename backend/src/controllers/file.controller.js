import * as fileService from "../services/file.service.js";

export async function listApprovedFiles(_req, res) {
  const data = await fileService.getApprovedFiles();
  res.status(200).json({ data });
}

export async function listTrendingFiles(_req, res) {
  const data = await fileService.getTrendingFiles();
  res.status(200).json({ data });
}

export async function listMySubmissions(req, res) {
  const data = await fileService.getUserSubmissions(req.user.userId);
  res.status(200).json({ data });
}

export async function uploadFile(req, res) {
  const data = await fileService.createUpload({
    userId: req.user.userId,
    body: req.body,
    file: req.file
  });

  res.status(201).json({
    message: "Upload submitted for moderation",
    data
  });
}
