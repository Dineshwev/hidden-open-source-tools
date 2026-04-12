export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Terms of Service</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Platform usage terms</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          Last updated: {new Date().toLocaleDateString()}. These terms describe acceptable use, upload responsibilities, sponsor interactions, and the limits of our service commitments.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">User uploads</h2>
          <p className="mt-3 text-sm">
            By uploading files, you confirm that you own the rights or have permission to distribute the content and that the metadata you provide is accurate to the best of your knowledge.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Acceptable use</h2>
          <p className="mt-3 text-sm">
            You may not abuse the mystery box, automate ad interactions, interfere with moderation, or attempt to bypass access controls or rate limits.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Sponsor placements</h2>
          <p className="mt-3 text-sm">
            Sponsor links and banners are provided as part of the platform experience. We try to keep them transparent and non-blocking, but availability and targeting may change.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Service limits</h2>
          <p className="mt-3 text-sm">
            We may modify, suspend, or discontinue features, ads, or unlock flows at any time to protect users, comply with law, or improve the product.
          </p>
        </section>
      </div>
    </div>
  );
}


