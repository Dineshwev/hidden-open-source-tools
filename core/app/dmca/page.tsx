export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">DMCA</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Copyright complaint procedure</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          We respect intellectual property rights and review valid notices promptly. If you believe a file on the platform infringes your work, use the form below or email the contact address directly.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What to include</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>1. The exact URL of the allegedly infringing file.</li>
            <li>2. Proof of ownership or authority to act for the rights holder.</li>
            <li>3. A statement that the information is accurate and you are authorized to submit the notice.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-3 text-sm">
            Send complaints to:
          </p>
          <a href="mailto:support@thecloudrain.site" className="mt-3 inline-flex text-cyan-300 hover:text-cyan-200">
            support@thecloudrain.site {/* TODO: Replace with your actual DMCA email */}
          </a>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Review process</h2>
          <p className="mt-3 text-sm">
            Valid notices are reviewed and may lead to temporary removal, content restriction, or follow-up questions for clarification before action is taken.
          </p>
        </section>
      </div>
    </div>
  );
}


