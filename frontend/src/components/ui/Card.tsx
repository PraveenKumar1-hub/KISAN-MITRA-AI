export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>{children}</div>;
}