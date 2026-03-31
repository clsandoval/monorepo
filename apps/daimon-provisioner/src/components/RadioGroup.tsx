'use client';

interface RadioGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="radio-bar">
      {options.map(opt => (
        <button
          key={opt}
          className={`radio-opt${value === opt ? ' on' : ''}`}
          onClick={() => onChange(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
