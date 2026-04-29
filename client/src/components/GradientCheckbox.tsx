interface GradientCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const GradientCheckbox = ({ checked, onChange, label }: GradientCheckboxProps) => {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer"
      onClick={onChange}
    >
      <div
        className="w-4 h-4 rounded-[3px] flex items-center justify-center flex-shrink-0"
        style={{
          background: checked
            ? 'linear-gradient(90deg, #3ABEFF, #2EC4B6)'
            : 'transparent',
          border: checked
            ? 'none'
            : '1px solid',
          borderImageSource: checked
            ? 'none'
            : 'linear-gradient(90deg, #3ABEFF, #2EC4B6)',
          borderImageSlice: checked ? 'none' : '1',
          outline: checked ? 'none' : '1px solid #3ABEFF',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <span className="text-white/70 text-sm">{label}</span>
    </label>
  );
};

export default GradientCheckbox;