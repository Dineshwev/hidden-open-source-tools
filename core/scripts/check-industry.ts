import { getAdmin } from "../lib/backend_lib/supabase-server";

async function main() {
  const supabase = getAdmin();
  const { data, error } = await supabase.from('industry_pages').select('*').limit(1);
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

main();
