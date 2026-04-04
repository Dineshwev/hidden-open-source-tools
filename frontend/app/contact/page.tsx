"use client";

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto py-20 px-6 space-y-8">
      <h1 className="font-display text-4xl font-bold text-white mb-6">Contact Support</h1>
      <p className="text-white/70">Need help with an upload or encounter a bug? Send our moderation team a message.</p>
      
      <form className="space-y-6 mt-8" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
          <input type="email" className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
          <textarea rows={4} className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500" placeholder="How can we help?" />
        </div>
        <button className="btn-premium w-full">Send Message</button>
      </form>
    </div>
  );
}
