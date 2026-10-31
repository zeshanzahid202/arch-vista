import { notFound } from "next/navigation";
import { getContent, publicList } from "@/lib/content";
import { contentMetadata } from "@/lib/metadata";
import { cleanHtml } from "@/lib/html";
import {
  ConsultationCTA,
  Eyebrow,
  Picture,
  ProjectCard,
  TextLink,
} from "@/components/public";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return contentMetadata(
    await getContent("projects", slug),
    `/projects/${slug}`,
  );
}
export default async function Project({ params }: Props) {
  const { slug } = await params;
  const item = await getContent("projects", slug);
  if (!item) notFound();
  const related = await publicList(
    "projects",
    new URLSearchParams({ category: item.category, limit: "4" }),
  );
  const others = related.items.filter((i) => i.slug !== slug);
  return (
    <>
      <section className="detail-hero">
        {item.cover && (
          <Picture src={item.cover.url} alt={item.cover.alt} priority />
        )}
      </section>
      <section className="container detail-heading">
        <Eyebrow>
          {item.category}
          {item.demo ? " / FICTIONAL DEMONSTRATION PROJECT" : ""}
        </Eyebrow>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <dl className="project-facts">
          {[
            ["Location", item.location],
            ["Year", item.year],
            ["Category", item.category],
            ["Area", item.area],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <dt>{k}</dt>
              <dd>{v || "To be confirmed"}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="container content-section split-content">
        <div>
          <Eyebrow>THE PROJECT</Eyebrow>
          <h2>
            A thoughtful
            <br />
            response to place.
          </h2>
        </div>
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: cleanHtml(item.body) }}
        />
      </section>
      {[
        ["Design concept", item.concept],
        ["Material language", item.materials],
        ["The challenge", item.challenges],
        ["The architectural response", item.solution],
      ]
        .filter(([, v]) => v)
        .map(([label, text]) => (
          <section
            className="container content-section split-content"
            key={label}
          >
            <h2>{label}</h2>
            <p>{text}</p>
          </section>
        ))}
      <div className="container gallery-grid">
        {item.gallery?.map((image, i) => (
          <Picture key={`${image.url}-${i}`} src={image.url} alt={image.alt} />
        ))}
      </div>
      {others.length > 0 && (
        <section className="container content-section">
          <div className="section-heading">
            <h2>A shared sensibility.</h2>
            <TextLink href={`/projects/${others[0].slug}`}>
              Next project
            </TextLink>
          </div>
          <div className="project-grid">
            {others.slice(0, 2).map((p, i) => (
              <ProjectCard key={p._id} item={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <ConsultationCTA />
    </>
  );
}
