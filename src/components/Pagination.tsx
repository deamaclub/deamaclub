import Link from "next/link";

interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  basePath: string;
  extraParams?: Record<string, string>;
}

export default function Pagination({
  page,
  perPage,
  total,
  basePath,
  extraParams,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  function href(p: number) {
    const sp = new URLSearchParams(extraParams);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const showPages: number[] = [];
  const window = 2;
  for (
    let i = Math.max(1, page - window);
    i <= Math.min(totalPages, page + window);
    i++
  ) {
    showPages.push(i);
  }

  const linkBase =
    "min-w-9 inline-flex items-center justify-center h-9 px-3 text-sm rounded border border-deama-border hover:border-deama-red transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 mt-8"
    >
      {page > 1 && (
        <Link href={href(prev)} className={linkBase}>
          ← Prev
        </Link>
      )}
      {showPages[0] !== 1 && (
        <>
          <Link href={href(1)} className={linkBase}>
            1
          </Link>
          {showPages[0] > 2 && <span className="text-deama-muted">…</span>}
        </>
      )}
      {showPages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${linkBase} ${
            p === page
              ? "bg-deama-red border-deama-red text-white"
              : ""
          }`}
        >
          {p}
        </Link>
      ))}
      {showPages[showPages.length - 1] !== totalPages && (
        <>
          {showPages[showPages.length - 1] < totalPages - 1 && (
            <span className="text-deama-muted">…</span>
          )}
          <Link href={href(totalPages)} className={linkBase}>
            {totalPages}
          </Link>
        </>
      )}
      {page < totalPages && (
        <Link href={href(next)} className={linkBase}>
          Next →
        </Link>
      )}
    </nav>
  );
}
