interface GradientButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
}

const GradientButton = ({ label, onClick, loading }: GradientButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-4 rounded-[10px] text-[#1A1A1A] font-semibold text-base mt-4"
      style={{
        background: 'linear-gradient(90deg,  #0037AB, #2EC4B6)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
      }}
    >
      {loading ? 'Please wait...' : label}
    </button>
  );
};

export default GradientButton;