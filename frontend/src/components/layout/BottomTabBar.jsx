import { Home, LayoutList, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TABS = [
  { id: 'home', label: 'Inicio', Icon: Home },
  { id: 'expenses', label: 'Gastos', Icon: LayoutList },
  { id: 'settings', label: 'Ajustes', Icon: Settings },
];

export default function BottomTabBar() {
  const { state, dispatch } = useApp();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-black/80 border-t border-white/10 flex justify-around"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = state.activeTab === id;
        return (
          <button
            key={id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: id })}
            className="flex flex-col items-center py-2 px-6 gap-1 min-w-[60px]"
          >
            <Icon
              size={22}
              className={active ? 'text-[#0a84ff]' : 'text-[#8e8e93]'}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span className={`text-[10px] font-medium ${active ? 'text-[#0a84ff]' : 'text-[#8e8e93]'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
