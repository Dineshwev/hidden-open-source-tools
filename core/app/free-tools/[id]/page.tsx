import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  robots: { index: false, follow: false }
};

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: tool } = await supabase.from("open_source_tools").select("slug").eq("id", params.id).single();

  if (tool?.slug) {
    redirect(`/tools/${tool.slug}`);
  }

  redirect("/free-tools");
}
