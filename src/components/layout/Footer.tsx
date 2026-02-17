import Image from "next/image";

// TODO: Add newsletter signup form
// TODO: Add social media links
// TODO: Add sitemap links

export default function Footer() {
  return (
    <footer className="border-t border-brand-black/5 bg-brand-black text-brand-cream">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Image
              src="/Subconscious_Logo.png"
              alt="Subconscious"
              width={140}
              height={28}
              className="brightness-0 invert mb-4"
            />
            <p className="max-w-sm text-sm leading-relaxed text-brand-cream/60">
              AI-powered deep research for MIT&apos;s Orbit Jetpack system.
              Upload your documents, get citations, and receive actionable
              recommendations — powered by Subconscious.dev agents.
            </p>
            {/* TODO: Add social media icon links */}
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-brand-cream/60">
              {/* TODO: Add real links as pages are built */}
              <li><a href="#how-it-works" className="hover:text-brand-cream transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-brand-cream transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">API Reference</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-brand-cream/60">
              {/* TODO: Add real links */}
              <li><a href="https://subconscious.dev" className="hover:text-brand-cream transition-colors">Subconscious.dev</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">About Orbit</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-cream/10 pt-8 md:flex-row">
          <p className="text-xs text-brand-cream/40">
            &copy; {new Date().getFullYear()} Subconscious AI. Built for MIT Orbit.
          </p>
          <p className="text-xs text-brand-cream/40">
            Powered by{" "}
            <a
              href="https://subconscious.dev"
              className="text-brand-orange hover:underline"
            >
              Subconscious.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
