import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';
import { useApp } from '../../context/AppContext';

const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#22c55e', '#94a3b8'];
const ICONS = ['tag', 'shopping-cart', 'car', 'home', 'heart-pulse', 'gamepad-2', 'zap', 'gift', 'utensils', 'plane'];

const EMPTY_FORM = { name: '', color: COLORS[0], icon: ICONS[0], budget_limit: '' };

export default function CategoryFormSheet({ open, onClose, category }) {
  const { addCategory, editCategory, removeCategory } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(category);

  useEffect(() => {
    if (open) {
      if (category) {
        setForm({
          name: category.name,
          color: category.color,
          icon: category.icon,
          budget_limit: category.budget_limit > 0 ? String(category.budget_limit) : '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError('');
    }
  }, [open, category]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, budget_limit: parseFloat(form.budget_limit) || 0 };
      if (isEdit) {
        await editCategory(category.id, payload);
      } else {
        await addCategory(payload);
      }
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?\nLas transacciones quedarán sin categoría.`)) return;
    setDeleting(true);
    try {
      await removeCategory(category.id);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Editar categoría' : 'Nueva categoría'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-[#8e8e93] text-xs font-medium block mb-1">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej: Ropa"
            className="w-full bg-[#2c2c2e] text-white rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#0a84ff]"
          />
        </div>

        <div>
          <label className="text-[#8e8e93] text-xs font-medium block mb-2">Color</label>
          <div className="flex gap-2.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set('color', c)}
                className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/40' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-[#8e8e93] text-xs font-medium block mb-1">Límite mensual (€)</label>
          <input
            type="number"
            value={form.budget_limit}
            onChange={(e) => set('budget_limit', e.target.value)}
            placeholder="0 = sin límite"
            className="w-full bg-[#2c2c2e] text-white rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#0a84ff]"
          />
        </div>

        {error && <p className="text-[#ff453a] text-xs">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving || deleting}
          className="w-full bg-[#0a84ff] text-white font-semibold rounded-2xl py-3.5 text-sm mt-2 active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </button>

        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={saving || deleting}
            className="w-full flex items-center justify-center gap-2 text-[#ff453a] text-sm font-medium py-2 disabled:opacity-50"
          >
            <Trash2 size={15} />
            {deleting ? 'Eliminando…' : 'Eliminar categoría'}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
