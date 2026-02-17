interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-brand-black/5 bg-white p-6 ${
        hover ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
