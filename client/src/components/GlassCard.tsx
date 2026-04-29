const GlassCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="w-full rounded-3xl flex-1 px-8 py-10 overflow-y-auto"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.05), 0 -8px 20px rgba(0,0,0,0.2)',
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;