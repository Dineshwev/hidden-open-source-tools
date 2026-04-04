export default function DmcaPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-8">
      <h1 className="font-display text-4xl font-bold text-white mb-6">DMCA Takedown Request</h1>
      <div className="space-y-6 text-white/70 leading-relaxed">
        <p>We respect intellectual property rights. If you believe a heavily heavily modified file or original asset uploaded by a user infringes on your copyright, email us immediately.</p>
        <p>Please include the URL of the offending file, proof of original ownership, and a formal signed statement.</p>
        <a href="mailto:dmca@example.com" className="text-cyan-400 hover:text-cyan-300">dmca@example.com</a>
      </div>
    </div>
  );
}
