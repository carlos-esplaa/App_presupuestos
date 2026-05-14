export default function SettingsSection({ title, children }) {
  return (
    <div>
      {title && (
        <p className="text-[#8e8e93] text-xs font-semibold uppercase tracking-wide px-1 mb-2">{title}</p>
      )}
      <div className="bg-[#1c1c1e] rounded-3xl overflow-hidden divide-y divide-white/5">
        {children}
      </div>
    </div>
  );
}
