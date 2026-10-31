import { notFound } from "next/navigation";
import { getContent, publicList } from "@/lib/content";
import { contentMetadata, jsonLd } from "@/lib/metadata";
import { cleanHtml } from "@/lib/html";
import { ArticleCard, ConsultationCTA, PageHero } from "@/components/public";
import { site } from "@/config/site";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return contentMetadata(
    await getContent("articles", slug),
    `/journal/${slug}`,
  );
}
export default async function Article({ params }: Props) {
  const { slug } = await params;
  const item = await getContent("articles", slug);
  if (!item) notFound();
  const related = await publicList(
    "articles",
    new URLSearchParams({ category: item.category, limit: "4" }),
  );
  const url = `${site.url}/journal/${slug}`;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.title,
            image: item.cover?.url,
            datePublished: item.publishedAt,
            dateModified: item.updatedAt,
            author: {
              "@type": "Person",
              name: item.author || "ArchVista editorial",
            },
          }),
        }}
      />
      <PageHero
        label={`${item.category}${item.demo ? " / FICTIONAL EDITORIAL SAMPLE" : ""}`}
        title={item.title}
        text={item.summary}
        image={item.cover}
      />
      <article className="container">
        <div className="article-byline">
          <span>By {item.author || "ArchVista editorial"}</span>
          <time dateTime={item.publishedAt}>
            {item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </time>
          {item.tags?.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
        <div
          className="rich-content article-body"
          dangerouslySetInnerHTML={{ __html: cleanHtml(item.body) }}
        />
        <div className="share-links">
          <span>Share this perspective</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(url)}`}
          >
            Email ↗
          </a>
        </div>
      </article>
      <section className="container content-section">
        <div className="section-heading">
          <h2>Further reading.</h2>
        </div>
        <div className="article-grid">
          {related.items
            .filter((i) => i.slug !== slug)
            .slice(0, 3)
            .map((i) => (
              <ArticleCard item={i} key={i._id} />
            ))}
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
