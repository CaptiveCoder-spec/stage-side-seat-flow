
interface SectionHeaderProps {
  title: string;
  price?: string;
}

const SectionHeader = ({ title, price }: SectionHeaderProps) => {
  return (
    <div className="mb-4 mt-8 first:mt-0">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
        {price && (
          <div className="text-sm text-gray-600 font-medium">{price}</div>
        )}
      </div>
      <div className="w-full h-px bg-gray-300 mt-2"></div>
    </div>
  );
};

export default SectionHeader;
