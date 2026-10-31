import { notFound } from "next/navigation";
import { getContent, publicList } from "@/lib/content";
import { contentMetadata } from "@/lib/metadata";
import { cleanHtml } from "@/lib/html";
import {
  ConsultationCTA,
  Eyebrow,
  PageHero,
  Process,
  ProjectCard,
} from "@/components/public";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return contentMetadata(
    await getContent("services", slug),
    `/services/${slug}`,
  );
}
export default async function Service({ params }: Props) {
  const item = await getContent("services", (await params).slug);
  if (!item) notFound();
  const projects = await publicList(
    "projects",
    new URLSearchParams({ limit: "2" }),
  );
  return (
    <>
      <PageHero
        label="OUR EXPERTISE"
        title={item.title}
        text={item.summary}
        image={item.cover}
      />
      <section className="container content-section split-content">
        <div>
          <Eyebrow>THE APPROACH</Eyebrow>
          <h2>
            Designed around
            <br />
            your possibilities.
          </h2>
        </div>
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: cleanHtml(item.body) }}
        />
      </section>
      <section className="container content-section">
        <Eyebrow>WHAT THIS BRINGS</Eyebrow>
        <div className="values-list">
          {item.benefits?.map((b, i) => (
            <div key={b}>
              <span className="service-index">0{i + 1}</span>
              <h3>{b}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="container content-section">
        <h2 style={{ marginBottom: 45 }}>The journey.</h2>
        <Process stages={item.stages?.length ? item.stages : undefined} />
      </section>
      {item.faqs?.length > 0 && (
        <section className="container content-section">
          <h2>Your questions, considered.</h2>
          <div className="faq-list">
            {item.faqs.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      {projects.items.length > 0 && (
        <section className="container content-section">
          <h2 style={{ marginBottom: 40 }}>The work behind the words.</h2>
          <div className="project-grid">
            {projects.items.map((p, i) => (
              <ProjectCard key={p._id} item={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <ConsultationCTA />
    </>
  );
}
