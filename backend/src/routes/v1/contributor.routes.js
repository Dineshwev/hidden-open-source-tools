import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { 
  flagInvalidHashSubmission, 
  updateReputationForUpload, 
  getUserReputationSummary,
  processSubmissionsBatch 
} from "../../services/contributorService.js";
import { validateAssetSubmissionSafe } from "../../validators/assetSubmissionValidators.js";

export const contributorRouter = express.Router();

/**
 * @route   POST /api/v1/contributor/validate-submission
 * @desc    Validate an asset submission and flag if missing SHA-256 hash
 * @access  Private
 */
contributorRouter.post("/validate-submission", authenticate, (req, res) => {
  const validation = validateAssetSubmissionSafe(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission data",
      errors: validation.errors
    });
  }

  const flagResult = flagInvalidHashSubmission(validation.data);

  res.json({
    success: true,
    data: flagResult,
    message: flagResult.message
  });
});

/**
 * @route   POST /api/v1/contributor/process-upload
 * @desc    Process a successful upload and update user reputation
 * @access  Private
 */
contributorRouter.post("/process-upload", authenticate, async (req, res) => {
  try {
    const { rating = 5 } = req.body;
    
    const result = await updateReputationForUpload(req.user.userId, rating);

    res.json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

/**
 * @route   GET /api/v1/contributor/reputation
 * @desc    Get user reputation summary
 * @access  Private
 */
contributorRouter.get("/reputation", authenticate, async (req, res) => {
  try {
    const summary = await getUserReputationSummary(req.user.userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

/**
 * @route   POST /api/v1/contributor/batch-validate
 * @desc    Validate multiple submissions and flag invalid ones
 * @access  Private
 */
contributorRouter.post("/batch-validate", authenticate, (req, res) => {
  const { submissions } = req.body;

  if (!Array.isArray(submissions)) {
    return res.status(400).json({
      success: false,
      message: "Submissions must be an array"
    });
  }

  const results = processSubmissionsBatch(submissions);

  res.json({
    success: true,
    data: results,
    message: `Processed ${results.total} submissions: ${results.valid} valid, ${results.flagged} flagged`
  });
});

