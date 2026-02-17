interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

const variantStyles = {
  primary:
    "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/25",
  secondary:
    "bg-brand-teal text-brand-black hover:bg-brand-teal/90",
  outline:
    "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white",
  ghost:
    "text-brand-gray hover:text-brand-black hover:bg-brand-cream",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
