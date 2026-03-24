import SectionHeading from "@/components/SectionHeading";

const pendingRows = [
  { title: "Dark mode icon pack", category: "Design assets", uploader: "NovaPixel", status: "Pending" },
  { title: "React starter template", category: "Coding resources", uploader: "CodeMeteor", status: "Pending" },
  { title: "Architecture class notes", category: "Student notes", uploader: "AstroNotes", status: "Pending" }
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin moderation"
        title="Review uploads and platform analytics"
        description="Admins can inspect pending files, approve safe contributions, reject harmful content, and monitor ecosystem growth."
      />

      <section className="grid gap-5 md:grid-cols-4">
        {[
          ["31", "Pending uploads"],
          ["1,240", "Approved files"],
          ["11,802", "Total downloads"],
          ["99.2%", "Safe scan pass rate"]
        ].map(([value, label]) => (
          <div key={label} className="glass-panel rounded-3xl p-6">
            <p className="font-display text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-white/60">{label}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[2rem] p-8">
        <div className="grid gap-4">
          {pendingRows.map((row) => (
            <div
              key={row.title}
              className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-5 md:grid-cols-[1.6fr_1fr_1fr_auto]"
            >
              <div>
                <h3 className="font-display text-xl text-white">{row.title}</h3>
                <p className="mt-1 text-sm text-white/60">{row.category}</p>
              </div>
              <p className="text-sm text-white/65">{row.uploader}</p>
              <p className="text-sm text-amber-300">{row.status}</p>
              <div className="flex gap-2">
                <button className="rounded-full bg-aurora px-4 py-2 text-sm font-semibold text-slate-900">Approve</button>
                <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
