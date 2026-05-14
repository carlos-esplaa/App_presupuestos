export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-[#1c1c1e] rounded-3xl p-5 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
