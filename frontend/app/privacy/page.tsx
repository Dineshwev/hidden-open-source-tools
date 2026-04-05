export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-8">
      <h1 className="font-display text-4xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-white/70 leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 className="text-2xl text-white font-semibold mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, upload files, or interact with our mystery box system.</p>
        </section>
        <section>
          <h2 className="text-2xl text-white font-semibold mb-3">2. Third-Party Advertisers</h2>
          <p>We partner with third-party ad networks which may collect anonymized IP addresses and browser data to serve relevant advertisements.</p>
        </section>
      </div>
    </div>
  );
}
