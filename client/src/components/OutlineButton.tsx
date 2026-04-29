interface OutlineButtonProps {
  label: string;
  onClick: () => void;
}

const OutlineButton = ({ label, onClick }: OutlineButtonProps) => {
  return (
    <div
      className="w-full max-w-xs rounded-[10px] p-[1.5px] cursor-pointer"
      style={{
        background: 'linear-gradient(90deg, #3ABEFF 0%, #2EC4B6 100%)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
      }}
      onClick={onClick}
    >
      <div
        className="w-full py-4 rounded-[10px] flex items-center justify-center "
        style={{ background: '#0F1B3D' }}
      >
        <span className="text-white font-normal text-base">{label}</span>
      </div>
    </div>
  );
};

export default OutlineButton;