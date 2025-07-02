
import React from 'react';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
        {title}
      </h4>
      <div className="w-full h-px bg-gray-200 mt-1"></div>
    </div>
  );
};

export default SectionHeader;
