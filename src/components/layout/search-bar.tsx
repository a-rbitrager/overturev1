import Form from "next/form";
import { Search, Sparkles, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ defaultValue }: { defaultValue: string }) {
  return (
    <Form
      action="/"
      className="flex w-full flex-col gap-3 rounded-[28px] border border-white/10 bg-black/10 p-3 md:flex-row md:items-center"
    >
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/6 text-[color:var(--muted-foreground)]">
          <Search className="h-4 w-4" />
        </div>
        <Input
          aria-label="Search tracks, albums, and artists"
          className="border-0 bg-transparent px-0 focus-visible:ring-0"
          defaultValue={defaultValue}
          name="query"
          placeholder="Search the catalog, albums, or artists"
        />
      </div>
      <div className="flex items-center gap-2">
        {defaultValue ? (
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full px-3 text-sm text-[color:var(--muted-foreground)] transition hover:bg-white/8 hover:text-white"
            href="/"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Link>
        ) : (
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            Search is instant
          </div>
        )}
        <Button type="submit">Search</Button>
      </div>
    </Form>
  );
}
