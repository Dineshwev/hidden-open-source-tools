import { getAdmin } from "@/lib/backend_lib/supabase-server";

export async function getApprovedSuccessToolCount(): Promise<number> {
  try {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("open_source_tools")
      .select("slug")
      .or("status.eq.approved,status.eq.APPROVED");

    if (!error && Array.isArray(data) && data.length > 0) {
      const uniqueSlugs = new Set(
        data
          .map((r: any) => String(r.slug || "").trim().toLowerCase())
          .filter(Boolean)
      );
      if (uniqueSlugs.size > 0) {
        return uniqueSlugs.size;
      }
    }
  } catch (err) {
    console.error("Failed to fetch tool count from DB:", err);
  }
  return 479;
}
