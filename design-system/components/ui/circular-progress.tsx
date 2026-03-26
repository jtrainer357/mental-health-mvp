/**
 * CircularProgress — SVG-based circular progress indicator
 */

interface CircularProgressProps {
  percentage: number;
  color: "teal" | "coral" | "gray";
  size?: number;
  label?: string;
}

export function CircularProgress({
  percentage,
  color,
  size = 100,
  label = "Collections Rate",
}: CircularProgressProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColor =
    color === "teal" ? "stroke-teal-dark" : color === "coral" ? "stroke-primary" : "stroke-border";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}
