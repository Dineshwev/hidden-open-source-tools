import FileCard from "@/components/FileCard";
import SectionHeading from "@/components/SectionHeading";

const dashboardItems = [
  {
    title: "Synthwave Icon Pack",
    description: "Approved and now available inside the mystery-box pool.",
    category: "Graphics",
    status: "Approved"
  },
  {
    title: "Motion Preset Bundle",
    description: "Pending moderator review after automated validation checks.",
    category: "Video",
    status: "Pending"
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Protected workspace"
        title="User Dashboard"
        description="This dashboard is ready to evolve into a fully authenticated experience with profile management, upload queues, and mystery history."
      />

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["12", "Uploads submitted"],
          ["8", "Approved assets"],
          ["134", "Total unlocks"],
          ["17", "Current streak"],
          ["1480", "Contributor points"],
          ["Daily", "Mystery reward"]
        ].map(([value, label]) => (
          <div key={label} className="glass-panel rounded-3xl p-6">
            <p className="font-display text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-white/60">{label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-white">Recent Uploads</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {dashboardItems.map((item) => (
            <FileCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-8">
        <h2 className="font-display text-2xl font-semibold text-white">Download History</h2>
        <div className="mt-5 grid gap-4">
          {["Legendary prompt pack", "Rare dashboard template", "Common notes bundle"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white/70">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
