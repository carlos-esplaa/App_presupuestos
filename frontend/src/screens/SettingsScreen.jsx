import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import IOSHeader from '../components/layout/IOSHeader';
import SettingsSection from '../components/settings/SettingsSection';
import SyncButton from '../components/settings/SyncButton';
import CategoryFormSheet from '../components/settings/CategoryFormSheet';
import { useCategories } from '../hooks/useCategories';

export default function SettingsScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { categories } = useCategories();
  const userCategories = categories.filter((c) => !c.is_system);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <IOSHeader title="Ajustes" />
      <div
        className="flex flex-col gap-6 px-4 pb-28 scroll-ios no-scrollbar overflow-y-auto"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)' }}
      >
        <SettingsSection title="Sincronización bancaria">
          <SyncButton />
        </SettingsSection>

        <SettingsSection title="Categorías">
          {userCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-white text-sm">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8e8e93] text-xs">
                  {cat.budget_limit > 0 ? cat.budget_limit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : 'Sin límite'}
                </span>
                <ChevronRight size={14} className="text-[#8e8e93]" />
              </div>
            </div>
          ))}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 w-full text-left"
          >
            <div className="w-6 h-6 rounded-full bg-[#0a84ff]/20 flex items-center justify-center">
              <Plus size={14} className="text-[#0a84ff]" />
            </div>
            <span className="text-[#0a84ff] text-sm font-medium">Añadir categoría</span>
          </button>
        </SettingsSection>

        <SettingsSection title="Información">
          <div className="px-5 py-3.5 flex justify-between">
            <span className="text-[#8e8e93] text-sm">Versión</span>
            <span className="text-white text-sm">1.0.0</span>
          </div>
          <div className="px-5 py-3.5 flex justify-between">
            <span className="text-[#8e8e93] text-sm">Backend</span>
            <span className="text-white text-sm">{import.meta.env.VITE_API_URL}</span>
          </div>
        </SettingsSection>
      </div>

      <CategoryFormSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
