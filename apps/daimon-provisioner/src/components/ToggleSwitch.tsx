'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      className={`toggle-track${checked ? ' on' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      type="button"
      disabled={disabled}
    >
      <div className="toggle-thumb" />
    </button>
  );
}
