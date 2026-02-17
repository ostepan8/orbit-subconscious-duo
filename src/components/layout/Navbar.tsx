import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Research", href: "#research-preview" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/Subconscious_Logo.png"
            alt="Subconscious"
            width={160}
            height={32}
            priority
          />
          <span className="text-sm font-medium text-brand-gray">
            &times; Orbit
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-gray transition-colors hover:text-brand-black"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-orange/90 shadow-md shadow-brand-orange/20 md:block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
