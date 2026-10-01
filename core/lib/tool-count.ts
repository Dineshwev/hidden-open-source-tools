import { getAdmin } from "@/lib/backend_lib/supabase-server";

export async function getApprovedSuccessToolCount(): Promise<number> {
  try {
    const supabase = getAdmin();
    const { count, error } = await supabase
      .from("open_source_tools")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("structured_content_status", "success");

    if (!error && typeof count === "number" && count > 0) {
      return count;
    }
  } catch (err) {
    console.error("Failed to fetch tool count from DB:", err);
  }
  return 375;
}
