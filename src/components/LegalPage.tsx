import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  effectiveDate?: string;
  children: ReactNode;
}

export default function LegalPage({
  title,
  effectiveDate,
  children,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 border-b border-deama-border pb-6">
        <h1 className="font-display text-4xl tracking-wide text-deama-gold-bright">
          {title.toUpperCase()}
        </h1>
        {effectiveDate && (
          <p className="text-xs uppercase tracking-widest text-deama-muted mt-2">
            Effective {effectiveDate}
          </p>
        )}
      </header>
      <div className="space-y-5 text-[15px] leading-relaxed text-deama-text/90 [&_h2]:font-display [&_h2]:tracking-wide [&_h2]:text-xl [&_h2]:text-deama-gold-bright [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_a]:text-deama-red [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1">
        {children}
      </div>
    </article>
  );
}
