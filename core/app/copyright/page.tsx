export default function CopyrightPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Copyright</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Copyright policy and ownership</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          This page explains how original work, user uploads, and platform assets are treated. It is written to support a professional operating standard and a clear takedown path.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Ownership</h2>
          <p className="mt-3 text-sm">
            Uploaders keep ownership of their own submissions unless a separate license is stated. By uploading content, you confirm you have rights to share it on this platform.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Platform content</h2>
          <p className="mt-3 text-sm">
            The site layout, branding, code, copy, and visual components are protected as platform assets. Reuse should follow the applicable license or written permission.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Takedown requests</h2>
          <p className="mt-3 text-sm">
            If you believe material on the site infringes your copyright, submit a DMCA request with the file URL, proof of ownership, and a signed statement to the contact listed on the DMCA page.
          </p>
        </section>
      </div>
    </div>
  );
}


