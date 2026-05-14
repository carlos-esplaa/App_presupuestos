export default function ProgressBar({ percent, className = '', height = 'h-2' }) {
  const clamped = Math.min(100, Math.max(0, percent || 0));

  const color =
    clamped >= 80 ? 'bg-[#ff453a]' :
    clamped >= 50 ? 'bg-[#ffd60a]' :
    'bg-[#0a84ff]';

  return (
    <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
