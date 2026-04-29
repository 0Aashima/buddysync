const GradientBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="min-h-screen w-full flex justify-center "
      style={{
        background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)',
      }}
    >
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;