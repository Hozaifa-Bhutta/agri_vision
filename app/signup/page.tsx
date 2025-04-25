'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GroupBase, StylesConfig } from 'react-select';

// Define option type
export type SelectOption = {
  label: string;
  value: string;
};

// Dynamic import for react-select with proper typing
const Select = dynamic(() =>
  import('react-select').then((mod) => mod.default)
) as unknown as React.FC<{
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  options: SelectOption[];
  isSearchable?: boolean;
  placeholder?: string;
  styles?: StylesConfig<SelectOption, false, GroupBase<SelectOption>>;
  id?: string;
}>;

const customStyles: StylesConfig<SelectOption, false> = {
  control: (provided) => ({
    ...provided,
    minHeight: '40px',
    borderColor: '#ccc',
    boxShadow: 'none',
  }),
};

const counties: SelectOption[] = [
  { value: 'county1', label: 'County 1' },
  { value: 'county2', label: 'County 2' },
  { value: 'county3', label: 'County 3' },
];

export default function SignupPage() {
  const [selectedCounty, setSelectedCounty] = useState<SelectOption | null>(null);

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>

      <div className="mb-4">
        <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
          County:
        </label>
        <Select
          id="county"
          options={counties}
          value={selectedCounty}
          onChange={(option) => setSelectedCounty(option)}
          isSearchable
          placeholder="Select a county"
          styles={customStyles}
        />
      </div>

      {/* You can add more form fields here */}
    </div>
  );
}
