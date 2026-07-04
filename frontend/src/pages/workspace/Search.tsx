import { Search as SearchIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8">
      <SearchIcon className="mb-4 h-8 w-8 text-primary" />
      <h1 className="text-2xl font-semibold tracking-normal">Search</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Search will be wired to `/api/search?q=` in its module. Current query: {query || "none"}.
      </p>
    </div>
  );
}
