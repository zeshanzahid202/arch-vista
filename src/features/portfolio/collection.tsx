import Link from "next/link";
import { Search } from "lucide-react";
import { publicList } from "@/lib/content";
import { ArticleCard, EmptyContent, ProjectCard } from "@/components/public";
import { categories } from "@/config/site";
export async function Collection({
  type,
  search,
}: {
  type: "projects" | "articles";
  search: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search))
    if (value) params.set(key, value);
  const result = await publicList(type, params);
  const root = type === "articles" ? "/journal" : "/projects";
  const all =
    type === "articles"
      ? await publicList(type, new URLSearchParams({ limit: "100" }))
      : result;
  const filters =
    type === "articles"
      ? Array.from(new Set(all.items.map((i) => i.category))).filter(Boolean)
      : categories;
  function href(change: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(change)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    return `${root}?${next}`;
  }
  return (
    <div className="container">
      <div className="filters">
        <nav className="filter-tabs" aria-label="Categories">
          {["All", ...filters].map((c) => (
            <Link
              key={c}
              href={href({ category: c === "All" ? "" : c, page: "" })}
              className={(search.category || "All") === c ? "active" : ""}
            >
              {c}
            </Link>
          ))}
        </nav>
        <form className="search-input" action={root}>
          {search.category && (
            <input type="hidden" name="category" value={search.category} />
          )}
          <label className="sr-only" htmlFor="collection-search">
            Search {type}
          </label>
          <input
            id="collection-search"
            name="q"
            defaultValue={search.q}
            placeholder={`Search ${type === "articles" ? "stories" : "projects"}...`}
            maxLength={120}
          />
          <button aria-label="Search">
            <Search size={16} />
          </button>
        </form>
      </div>
      {result.items.length ? (
        <div className={type === "projects" ? "project-grid" : "article-grid"}>
          {result.items.map((item, i) =>
            type === "projects" ? (
              <ProjectCard key={item._id} item={item} index={i} />
            ) : (
              <ArticleCard key={item._id} item={item} />
            ),
          )}
        </div>
      ) : (
        <EmptyContent unavailable={result.unavailable} type={type} />
      )}
      <nav className="pagination" aria-label="Pagination">
        {Array.from({ length: Math.min(result.pages, 30) }, (_, i) => (
          <Link
            key={i}
            href={href({ page: String(i + 1) })}
            className={result.page === i + 1 ? "active" : ""}
            aria-current={result.page === i + 1 ? "page" : undefined}
          >
            {i + 1}
          </Link>
        ))}
      </nav>
    </div>
  );
}
