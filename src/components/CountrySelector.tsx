import React from "react";
import Select from "react-select";
import { countries } from "@/lib/countries";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Prepare options with emojis
const options: Option[] = countries.map((c) => ({
  value: c.code,
  label: `${c.emoji} ${c.label} (${c.code})`,
}));

const CountrySelector: React.FC<Props> = ({ value, onChange }) => {
  const selected = options.find((o) => o.value === value) || null;

  return (
    <Select
      value={selected}
      onChange={(option) => {
        if (option) onChange(option.value);
      }}
      options={options}
      className="react-select-container"
      classNamePrefix="react-select"
      isSearchable
      placeholder="Select Country"
      styles={{
        control: (provided) => ({
          ...provided,
          backgroundColor: 'var(--tw-bg-opacity)',
          borderColor: '#3f3f46',
          color: 'white',
        }),
        menu: (provided) => ({
          ...provided,
          backgroundColor: '#27272a',
          color: 'white',
        }),
        singleValue: (provided) => ({
          ...provided,
          color: 'white',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isFocused ? '#3f3f46' : '#27272a',
          color: 'white',
        }),
      }}
    />
  );
};

export default CountrySelector;
