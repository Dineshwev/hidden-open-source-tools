import { prisma } from "../backend_lib/prisma.js";
import { AppError } from "../utils/appError.js";

/**
 * Flags submissions that lack a valid SHA-256 hash
 * @param {Object} submission - The asset submission data
 * @returns {Object} Validation result with flag status
 */
export function flagInvalidHashSubmission(submission) {
  const hasValidHash = submission.sha256Hash && /^[a-f0-9]{64}$/i.test(submission.sha256Hash);
  
  return {
    isValid: hasValidHash,
    flagged: !hasValidHash,
    message: hasValidHash 
      ? "Submission has valid SHA-256 hash"
      : "Submission flagged: Missing or invalid SHA-256 hash",
    submission
  };
}

/**
 * Updates user reputation and XP based on successful uploads
 * @param {string} userId - The user ID
 * @param {number} rating - The rating of the upload (1-5)
 * @returns {Promise<Object>} Updated user status
 */
export async function updateReputationForUpload(userId, rating = 5) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Base XP points based on rating
  const baseXp = rating >= 4 ? 50 : rating >= 3 ? 30 : 10;
  
  // Bonus XP for high-rated uploads
  const bonusXp = rating === 5 ? 25 : rating === 4 ? 10 : 0;
  
  // Calculate total XP
  const totalXp = baseXp + bonusXp;

  // Update user stats
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      contributorPoints: {
        increment: totalXp
      },
      successfulUploads: {
        increment: 1
      },
      totalRating: {
        increment: rating
      },
      // Calculate average rating
      averageRating: {
        set: Math.round((user.totalRating + rating) / (user.successfulUploads + 1))
      }
    }
  });

  // Determine new status based on contributor points
  const newStatus = calculateContributorStatus(updatedUser.contributorPoints);

  return {
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      contributorPoints: updatedUser.contributorPoints,
      successfulUploads: updatedUser.successfulUploads,
      averageRating: updatedUser.averageRating,
      status: newStatus
    },
    earnedXp: totalXp,
    message: `Successfully uploaded! Earned ${totalXp} XP points. New status: ${newStatus}`
  };
}

/**
 * Calculates contributor status based on points
 * @param {number} points - Total contributor points
 * @returns {string} Contributor status
 */
function calculateContributorStatus(points) {
  if (points >= 1000) return "LEGENDARY";
  if (points >= 500) return "EPIC";
  if (points >= 200) return "RARE";
  if (points >= 50) return "UNCOMMON";
  return "COMMON";
}

/**
 * Gets user reputation summary
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User reputation summary
 */
export async function getUserReputationSummary(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      contributorPoints: true,
      successfulUploads: true,
      totalRating: true,
      averageRating: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const status = calculateContributorStatus(user.contributorPoints);
  const totalDays = Math.ceil((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return {
    user: {
      id: user.id,
      username: user.username,
      status,
      contributorPoints: user.contributorPoints,
      successfulUploads: user.successfulUploads,
      averageRating: user.averageRating || 0,
      joinDate: user.createdAt
    },
    stats: {
      totalDays,
      uploadsPerDay: totalDays > 0 ? (user.successfulUploads / totalDays).toFixed(2) : 0,
      ratingDistribution: "N/A" // Would need additional queries to calculate
    }
  };
}

/**
 * Processes multiple submissions and flags invalid ones
 * @param {Array<Object>} submissions - Array of submission data
 * @returns {Object} Processing results
 */
export function processSubmissionsBatch(submissions) {
  const flagged = [];
  const valid = [];

  submissions.forEach(submission => {
    const result = flagInvalidHashSubmission(submission);
    if (result.flagged) {
      flagged.push(result);
    } else {
      valid.push(result.submission);
    }
  });

  return {
    total: submissions.length,
    valid: valid.length,
    flagged: flagged.length,
    flaggedSubmissions: flagged,
    validSubmissions: valid
  };
}

/**
 * Example usage and testing functions
 */
export const exampleUsage = {
  // Example asset submission data
  validSubmission: {
    title: "3D Model Pack",
    description: "High-quality 3D models for game development",
    fileUrl: "https://example.com/models.zip",
    creatorReputationScore: 85,
    sha256Hash: "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678"
  },

  invalidSubmission: {
    title: "Texture Pack",
    description: "Low-quality textures",
    fileUrl: "https://example.com/textures.zip",
    creatorReputationScore: 45,
    sha256Hash: "invalid-hash" // Invalid hash
  },

  missingHashSubmission: {
    title: "Audio Pack",
    description: "Sound effects collection",
    fileUrl: "https://example.com/audio.zip",
    creatorReputationScore: 75
    // Missing sha256Hash
  }
};

/**
 * Test function to demonstrate the system
 */
export function testContributorSystem() {
  console.log("=== Testing Contributor Trust System ===\n");

  // Test hash validation
  console.log("1. Testing Hash Validation:");
  console.log("Valid submission:", flagInvalidHashSubmission(exampleUsage.validSubmission));
  console.log("Invalid hash:", flagInvalidHashSubmission(exampleUsage.invalidSubmission));
  console.log("Missing hash:", flagInvalidHashSubmission(exampleUsage.missingHashSubmission));

  // Test batch processing
  console.log("\n2. Testing Batch Processing:");
  const submissions = [
    exampleUsage.validSubmission,
    exampleUsage.invalidSubmission,
    exampleUsage.missingHashSubmission
  ];
  console.log("Batch results:", processSubmissionsBatch(submissions));

  // Test status calculation
  console.log("\n3. Testing Status Calculation:");
  console.log("0 points:", calculateContributorStatus(0));
  console.log("75 points:", calculateContributorStatus(75));
  console.log("300 points:", calculateContributorStatus(300));
  console.log("600 points:", calculateContributorStatus(600));
  console.log("1200 points:", calculateContributorStatus(1200));
}