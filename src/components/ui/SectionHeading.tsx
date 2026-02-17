import Badge from "./Badge";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  centered = true,
}: SectionHeadingProps) {
  return (
    <div className={`mb-16 max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      {badge && (
        <Badge variant="orange" className="mb-4">
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-brand-gray leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
