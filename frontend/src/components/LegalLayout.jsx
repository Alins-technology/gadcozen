import { useEffect } from "react";
import Breadcrumbs from "./Breadcrumbs.jsx";

export default function LegalLayout({ title, updated = "August 2026", children }) {
  useEffect(() => {
    document.title = `${title} | GADCO ZEN`;
  }, [title]);

  return (
    <div>
      <div className="border-b border-brand-100 bg-brand-50/60 py-14">
        <div className="container-app">
          <Breadcrumbs items={[{ label: title }]} />
          <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-xs uppercase tracking-wide text-ink-500">
            Last updated: {updated}
          </p>
        </div>
      </div>

      <div className="container-app py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-100 bg-white p-8 shadow-soft sm:p-12">
          <div className="prose prose-sm max-w-none space-y-5 text-sm leading-relaxed text-ink-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
