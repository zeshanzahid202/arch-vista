import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ConsultationCTA,
  EmptyContent,
  Eyebrow,
  PageHero,
  Process,
  ProjectCard,
} from "@/components/public";
import { publicList } from "@/lib/content";
export const metadata = {
  alternates: { canonical: "/services" },
  title: "Our expertise",
  description:
    "An integrated approach to architecture, interiors, renovation, and spatial planning.",
};
export default async function Services() {
  const [services, projects] = await Promise.all([
    publicList("services"),
    publicList("projects", new URLSearchParams({ limit: "2" })),
  ]);
  return (
    <>
      <PageHero
        label="OUR EXPERTISE"
        title={"Considered from\nevery angle."}
        text="A connected approach to architecture and interiors. From a single room to a complete vision, we bring clarity, creativity, and care."
      />
      <section className="container">
        <div className="expertise-list">
          {services.items.length ? (
            services.items.map((s, i) => (
              <Link key={s._id} href={`/services/${s.slug}`}>
                <span className="service-index">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
                <ArrowUpRight />
              </Link>
            ))
          ) : (
            <EmptyContent unavailable={services.unavailable} type="services" />
          )}
        </div>
      </section>
      <section className="container content-section">
        <Eyebrow>A COLLABORATIVE JOURNEY</Eyebrow>
        <h2 style={{ margin: "25px 0 45px" }}>
          From first thought
          <br />
          to final detail.
        </h2>
        <Process />
      </section>
      {projects.items.length > 0 && (
        <section className="container content-section">
          <div className="section-heading">
            <h2>Ideas, made tangible.</h2>
          </div>
          <div className="project-grid">
            {projects.items.map((p, i) => (
              <ProjectCard key={p._id} item={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <section className="container content-section">
        <Eyebrow>A LITTLE CLARITY</Eyebrow>
        <h2 style={{ marginTop: 25 }}>Before we begin.</h2>
        <div className="faq-list">
          {[
            [
              "When should I involve an architect?",
              "The earlier, the better. Involving the studio before major commitments helps establish feasibility, priorities, and a clear brief.",
            ],
            [
              "Can we work together on an existing property?",
              "Yes. Renovation and interior projects begin with a careful understanding of the existing space and what you want to change.",
            ],
            [
              "How are fees established?",
              "Fees depend on the scope, complexity, and services required. We provide a tailored proposal after an initial conversation.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
