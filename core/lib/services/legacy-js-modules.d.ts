declare module "@/lib/services/admin.service.js" {
  export function getPendingUploads(...args: any[]): any;
  export function getModerationHistory(...args: any[]): any;
  export function moderateUpload(...args: any[]): any;
  export function getAnalyticsSnapshot(...args: any[]): any;
}

declare module "@/lib/services/auth.service.js" {
  export function createGuestUser(...args: any[]): any;
  export function getCurrentUser(...args: any[]): any;
}

declare module "@/lib/services/category.service.js" {
  export function getCategories(...args: any[]): any;
}

declare module "@/lib/services/file.service.js" {
  export function getApprovedFiles(...args: any[]): any;
  export function getTrendingFiles(...args: any[]): any;
  export function getUserSubmissions(...args: any[]): any;
  export function createUpload(...args: any[]): any;
  export function createServerlessUpload(...args: any[]): any;
}

declare module "@/lib/services/mystery.service.js" {
  export function unlockMysteryFile(...args: any[]): any;
  export function getDownloadHistory(...args: any[]): any;
  export function getDailyMysteryReward(...args: any[]): any;
}

declare module "@/lib/backend_lib/supabase.js" {
  export function getSupabaseConfigDiagnostics(...args: any[]): any;
  export function getSupabaseBucketName(...args: any[]): any;
  export function ensureSupabaseBucket(...args: any[]): any;
  export function getSupabaseClient(...args: any[]): any;
  export function hasSupabaseConfig(...args: any[]): any;
}

declare module "@/lib/utils/appError" {
  export class AppError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(message: string, statusCode?: number, details?: unknown);
  }
}