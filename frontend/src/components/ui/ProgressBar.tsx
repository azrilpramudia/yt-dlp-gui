type ProgressBarProps = {
  percent: number;
  indeterminate?: boolean;
  label?: string;
};

export function ProgressBar({ percent, indeterminate = false, label = 'Progress unduhan' }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-slate-700"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
      aria-valuetext={indeterminate ? 'Sedang menghitung' : `${value.toFixed(1)}%`}
    >
      <div
        className={`h-full rounded-full bg-blue-500 transition-[width] duration-300 ${indeterminate ? 'w-1/3 animate-pulse' : ''}`}
        style={indeterminate ? undefined : { width: `${value}%` }}
      />
    </div>
  );
}
