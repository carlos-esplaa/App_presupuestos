export default function IOSHeader({ title, subtitle, right }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
          {subtitle && <p className="text-[#8e8e93] text-xs mt-0.5">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  );
}
