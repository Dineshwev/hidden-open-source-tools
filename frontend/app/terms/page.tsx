export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-8">
      <h1 className="font-display text-4xl font-bold text-white mb-6">Terms of Service</h1>
      <div className="space-y-6 text-white/70 leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 className="text-2xl text-white font-semibold mb-3">1. User Uploads</h2>
          <p>By uploading files to Portfolio Universe, you confirm you have the right to distribute said files. We are not responsible for user-uploaded content.</p>
        </section>
        <section>
          <h2 className="text-2xl text-white font-semibold mb-3">2. Platform Usage</h2>
          <p>Users must not abuse the mystery box system or utilize automated bots to rapidly click advertisements.</p>
        </section>
      </div>
    </div>
  );
}
