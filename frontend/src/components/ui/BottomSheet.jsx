import { useEffect } from 'react';

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] bg-[#1c1c1e] rounded-t-3xl transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-white/10">
            <h2 className="text-white font-semibold text-base">{title}</h2>
            <button onClick={onClose} className="text-[#0a84ff] text-sm font-medium">Cerrar</button>
          </div>
        )}
        <div className="px-5 py-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}
