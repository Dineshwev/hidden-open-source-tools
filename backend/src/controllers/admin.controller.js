import * as adminService from "../services/admin.service.js";

export async function pendingUploads(_req, res) {
  const data = await adminService.getPendingUploads();
  res.status(200).json({ data });
}

export async function approveUpload(req, res) {
  const data = await adminService.moderateUpload({
    adminId: req.user.userId,
    fileId: req.params.fileId,
    status: "APPROVED"
  });

  res.status(200).json({ data });
}

export async function rejectUpload(req, res) {
  const data = await adminService.moderateUpload({
    adminId: req.user.userId,
    fileId: req.params.fileId,
    status: "REJECTED"
  });

  res.status(200).json({ data });
}

export async function analytics(_req, res) {
  const data = await adminService.getAnalyticsSnapshot();
  res.status(200).json({ data });
}
