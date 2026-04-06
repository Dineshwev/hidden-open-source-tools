export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Privacy Policy</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Privacy and data handling</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          Last updated: {new Date().toLocaleDateString()}. This policy explains what we collect, why we collect it, and how we protect user data on a sponsored download platform.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Information we collect</h2>
          <p className="mt-3 text-sm">
            We collect account details, upload metadata, moderation actions, and basic technical logs needed to operate the platform, prevent abuse, and keep unlock flows working.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">How we use data</h2>
          <p className="mt-3 text-sm">
            Data is used for authentication, file moderation, analytics, fraud prevention, and to deliver sponsor placements in a way that does not block the main user task.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Third-party services</h2>
          <p className="mt-3 text-sm">
            We may rely on hosting, storage, analytics, and sponsor providers. Those services may process limited technical information such as IP address, browser data, or referral context.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Your choices</h2>
          <p className="mt-3 text-sm">
            You can stop using the service at any time. If you want data removed or corrected, contact support and we will review the request under applicable law and operational constraints.
          </p>
        </section>
      </div>
    </div>
  );
}
