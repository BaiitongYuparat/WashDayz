
type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; //ข้อความ
};

function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-full border border-gray-300 w-[400px] text-base outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

export default SearchInput;