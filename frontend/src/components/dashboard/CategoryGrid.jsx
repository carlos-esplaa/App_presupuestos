import CategoryCard from './CategoryCard';

export default function CategoryGrid({ categories }) {
  const visible = categories.filter((c) => !c.is_system);

  if (!visible.length) return null;

  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3 px-1">Presupuesto por categorías</h2>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
