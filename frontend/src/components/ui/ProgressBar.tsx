type ProgressBarProps = {
  percent: number;
  indeterminate?: boolean;
  label?: string;
};

export function ProgressBar({ percent, indeterminate = false, label = 'Progress unduhan' }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
      aria-valuetext={indeterminate ? 'Sedang menghitung' : `${value.toFixed(1)}%`}
    >
      <div
        className={`progress-fill${indeterminate ? ' is-indeterminate' : ''}`}
        style={indeterminate ? undefined : { width: `${value}%` }}
      />
    </div>
  );
}
