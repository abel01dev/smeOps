import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              SO
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              SME Ops
            </span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="#features" className="hover:text-slate-900">
              Features
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Sign in
            </Link>
          </nav>
        </header>

        <section className="mx-auto max-w-3xl py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            Built for small shops & mini markets
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Sell faster. Track smarter. Grow with confidence.
          </h1>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-600 md:text-lg">
            A modern point-of-sale and business operations platform designed for
            buy-and-resell SMEs. Instant POS, real-time inventory, customer history,
            and AI-driven insights — all in one clean dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section id="features" className="grid gap-6 pb-16 md:grid-cols-3">
          <FeatureCard
            title="Lightning-fast POS"
            description="Find any product in two keystrokes. Add to cart, checkout, done — optimized for touch and keyboard."
          />
          <FeatureCard
            title="Live inventory"
            description="Stock decrements automatically on every sale. Low-stock alerts so you never run out."
          />
          <FeatureCard
            title="Insights that pay"
            description="Daily revenue, profit margins, top-selling products, and AI-driven recommendations."
          />
        </section>

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SME Ops Platform — built with Next.js, NestJS,
          and Prisma.
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
