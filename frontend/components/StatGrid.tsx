const stats = [
  { value: "8", label: "Content categories" },
  { value: "Rare", label: "Weighted reward tiers" },
  { value: "Manual", label: "Admin moderation" },
  { value: "Daily", label: "Streak mystery box" }
];

export default function StatGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="depth-panel glass-panel rounded-3xl p-5">
          <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
          <p className="mt-2 text-sm text-white/60">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
