interface BadgeProps {
  children: React.ReactNode;
  variant?: "orange" | "teal" | "green" | "gray";
  className?: string;
}

const variantStyles = {
  orange: "bg-brand-orange/10 text-brand-orange",
  teal: "bg-brand-teal/10 text-brand-teal",
  green: "bg-brand-green/10 text-brand-black",
  gray: "bg-brand-gray/10 text-brand-gray",
};

export default function Badge({ children, variant = "orange", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
