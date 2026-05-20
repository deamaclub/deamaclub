import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-6xl text-deama-red mb-4">404</h1>
      <p className="text-deama-muted mb-6">
        That video disappeared. Maybe the internet swallowed it.
      </p>
      <Link
        href="/"
        className="inline-block bg-deama-red hover:bg-deama-red-hover px-4 py-2 rounded font-semibold uppercase tracking-wider text-sm"
      >
        Back to home
      </Link>
    </div>
  );
}
