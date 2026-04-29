interface InputFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: InputFieldProps) => {
  return (
    <div className="flex flex-col gap-1 mb-6">
      <label className="text-white font-normal text-base">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent border-b border-white/30 text-white/60 placeholder-white/40 text-sm py-2 outline-none focus:border-[#2EC4B6] transition-colors"
      />
    </div>
  );
};

export default InputField;