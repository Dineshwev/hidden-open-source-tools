export default function LicensePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">License</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Platform and content license</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          This page explains how the site software, uploaded resources, and redistribution rights are handled. It is intentionally clear so users know what they can and cannot do.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Site software</h2>
          <p className="mt-3 text-sm">
            Unless otherwise noted, the application source code and interface design remain the property of the platform operator. Internal use, deployment, and modification are governed by the repository or deployment license you choose separately.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Uploaded files</h2>
          <p className="mt-3 text-sm">
            Files submitted by users are made available only under the terms selected at upload time. If no special license is selected, the default expectation is that users may download for personal use only unless the uploader grants broader rights.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Attribution and reuse</h2>
          <p className="mt-3 text-sm">
            Reuse of platform branding, visuals, and page copy requires permission. Reuse of user-uploaded content must follow the uploader&apos;s stated license or written permission.
          </p>
        </section>
      </div>
    </div>
  );
}


