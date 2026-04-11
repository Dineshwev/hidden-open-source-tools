import SectionHeading from "@/components/SectionHeading";

const contributors = [
  { name: "NovaPixel", points: 1480, streak: 17 },
  { name: "CodeMeteor", points: 1220, streak: 12 },
  { name: "AstroNotes", points: 980, streak: 9 }
];

export default function TopContributors() {
  return (
    <section className="depth-stage glass-panel rounded-[2rem] p-8">
      <SectionHeading
        eyebrow="Top contributors"
        title="Builders powering the mystery ecosystem"
        description="Contributor points, upload quality, and consistency all feed the public leaderboard and future gamification rewards."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {contributors.map((contributor, index) => (
          <article key={contributor.name} className="depth-panel rounded-3xl border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Rank #{index + 1}</p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-white">{contributor.name}</h3>
            <p className="mt-3 text-sm text-white/65">{contributor.points} contributor points</p>
            <p className="mt-1 text-sm text-aurora/80">{contributor.streak}-day streak</p>
          </article>
        ))}
      </div>
    </section>
  );
}
