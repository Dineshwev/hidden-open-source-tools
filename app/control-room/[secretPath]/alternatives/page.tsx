import { createClient } from "@supabase/supabase-js";
import AlternativesAdminClient from "@/components/admin/AlternativesAdminClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AlternativesAdminPage({
  params,
}: {
  params: { secretPath: string };
}) {
  if (params.secretPath !== process.env.ADMIN_SECRET_PATH) {
    return <div>Not found</div>;
  }

  const { data } = await supabase
    .from("alternatives")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Alternatives</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data?.length ?? 0} pages total
          </p>
        </div>
        <a
          href={`/control-room/${params.secretPath}`}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </a>
      </div>
      <AlternativesAdminClient initialData={data ?? []} />
    </div>
  );
}
