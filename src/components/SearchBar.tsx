"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-deama-muted pointer-events-none"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search videos…"
        className="w-full bg-deama-black border border-deama-border focus:border-deama-red rounded pl-9 pr-3 py-2 text-sm focus:outline-none transition-colors"
      />
    </form>
  );
}
