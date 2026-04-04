export default function SpaceBackground({ 
  className = ''
}: { className?: string }) {
  // Static, zero-CPU background replacing the heavy animated canvas
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* Base Space Void */}
      <div className="absolute inset-0 bg-[#030712]" />
      
      {/* Static Stars via CSS pattern */}
      <div className="absolute inset-0 mix-blend-screen opacity-60" 
           style={{
             backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1.5px)',
             backgroundSize: '48px 48px',
             backgroundPosition: '0 0'
           }}
      />
      <div className="absolute inset-0 mix-blend-screen opacity-40" 
           style={{
             backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1.5px)',
             backgroundSize: '96px 96px',
             backgroundPosition: '24px 24px'
           }}
      />

      {/* Static Nebula Glows */}
      <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen" />
      <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-600/10 blur-[130px] mix-blend-screen" />
      <div className="absolute -bottom-[30%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen" />
    </div>
  );
}

