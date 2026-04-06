export default function AdsDisclosurePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Ads Disclosure</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Sponsor transparency and ad policy</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          This page explains how sponsor placements appear on The Cloud Rain, what data may be used by ad providers, and how we keep ads from disrupting the main user experience.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">How ads appear</h2>
          <p className="mt-3 text-sm">
            Sponsor content may appear as banners, featured slots, or optional partner offers near content sections. We place these units where users naturally pause so they are visible without blocking the task at hand.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What providers may receive</h2>
          <p className="mt-3 text-sm">
            Depending on the provider, ad systems may process basic technical information such as browser details, approximate location, referral context, or device signals needed to render and measure the placement.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">No forced popups</h2>
          <p className="mt-3 text-sm">
            We avoid popup-heavy or deceptive ad flows. Sponsor links should open from a direct user click, and the page should remain usable even if a provider is unavailable.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">User experience priority</h2>
          <p className="mt-3 text-sm">
            Ads should support the platform, not frustrate the user. If a sponsor unit fails to load, the page should continue functioning and still provide access to the main content.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Contact for ad concerns</h2>
          <p className="mt-3 text-sm">
            If you believe a sponsor placement is misleading, broken, or inappropriate, contact support through the footer contact link and include the page URL and a short description of the issue.
          </p>
        </section>
      </div>
    </div>
  );
}
