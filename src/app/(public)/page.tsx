import Link from "next/link";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { heroImage } from "@/config/site";
import { publicList, optionalValues } from "@/lib/content";
import {
  ArticleCard,
  ConsultationCTA,
  EmptyContent,
  Eyebrow,
  Picture,
  Process,
  ProjectCard,
  TextLink,
} from "@/components/public";
import { Reveal } from "@/components/reveal";
export default async function Home() {
  const [projects, services, articles, testimonials] = await Promise.all([
    publicList(
      "projects",
      new URLSearchParams({ limit: "4", featured: "true" }),
    ),
    publicList("services", new URLSearchParams({ limit: "7" })),
    publicList("articles", new URLSearchParams({ limit: "3" })),
    publicList("testimonials", new URLSearchParams({ limit: "2" })),
  ]);
  let cms: Record<string, unknown> = {};
  try {
    cms = await optionalValues("homepage", "home");
  } catch {}
  const value = (key: string, fallback: string) =>
    typeof cms[key] === "string" ? String(cms[key]) : fallback;
  const cover =
    /^https:\/\/(images\.unsplash\.com|res\.cloudinary\.com)\//.test(
      value("heroImage", ""),
    )
      ? value("heroImage", heroImage)
      : heroImage;
  return (
    <>
      <section className="home-hero">
        <Picture
          src={cover}
          alt={value(
            "heroAlt",
            "A warm, light-filled interior opening onto a garden",
          )}
          priority
          className="hero-background"
        />
        <div className="hero-shade" />
        <div className="hero-content container">
          <div className="hero-kicker">
            <span className="tiny-line" /> ARCHITECTURE & INTERIOR DESIGN STUDIO
          </div>
          <h1>
            {value("heroTitle", "Spaces that inspire.\nDesign that endures.")
              .split("\n")
              .map((line, i) => (
                <span key={line} className={i === 1 ? "italic" : ""}>
                  {line}
                  <br />
                </span>
              ))}
          </h1>
          <div className="hero-bottom">
            <p>
              {value(
                "heroSubtitle",
                "Thoughtfully imagined. Beautifully lived.\nWe create architecture that connects people,\nplace, and possibility.",
              )}
            </p>
            <Link className="hero-project-link" href="/projects">
              Explore our work <ArrowUpRight size={22} />
            </Link>
          </div>
        </div>
        <div className="hero-footer container">
          <a href="#introduction">
            SCROLL TO DISCOVER <ArrowDown size={15} />
          </a>
          <span>DESIGNED WITH INTENTION. BUILT AROUND YOU.</span>
          <span>01 — 03</span>
        </div>
      </section>
      <section id="introduction" className="intro-section container">
        <Eyebrow number="01">THE ARCHVISTA PERSPECTIVE</Eyebrow>
        <Reveal className="intro-grid">
          <h2>
            {value(
              "introTitle",
              "We don’t just design spaces.\nWe shape the way you experience them.",
            )}
          </h2>
          <div>
            <p>
              {value(
                "introText",
                "Architecture is more than a structure. It’s the quiet interplay of light, material, and human experience. At ArchVista, we bring a considered approach to every space — creating places that feel as extraordinary as they look.",
              )}
            </p>
            <TextLink href="/about">Discover our studio</TextLink>
          </div>
        </Reveal>
        <div className="intro-caption">
          <span>THOUGHTFUL BY NATURE.</span>
          <span>TIMELESS BY DESIGN.</span>
          <Plus size={18} />
        </div>
      </section>
      <section className="work-section container">
        <div className="section-heading">
          <div>
            <Eyebrow number="02">SELECTED WORK</Eyebrow>
            <h2>
              A sense of place.
              <br />
              <em>A world of possibility.</em>
            </h2>
          </div>
          <TextLink href="/projects">View all projects</TextLink>
        </div>
        {projects.items.length ? (
          <div className="project-grid">
            {projects.items.map((item, i) => (
              <Reveal key={item._id}>
                <ProjectCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyContent unavailable={projects.unavailable} type="projects" />
        )}
      </section>
      <section className="philosophy">
        <Picture
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85"
          alt="Natural materials and generous daylight in a contemporary living space"
        />
        <div className="philosophy-content">
          <Eyebrow number="03">OUR PHILOSOPHY</Eyebrow>
          <h2>{value("philosophyTitle", "Less noise.\nMore meaning.")}</h2>
          <p>
            {value(
              "philosophyText",
              "We believe the most powerful spaces are often the most considered. Honest materials. Purposeful details. A connection to the natural world. Nothing unnecessary. Everything intentional.",
            )}
          </p>
          <TextLink href="/studio" light>
            Our way of thinking
          </TextLink>
        </div>
      </section>
      <section className="expertise-section container">
        <div className="section-heading">
          <div>
            <Eyebrow number="04">OUR EXPERTISE</Eyebrow>
            <h2>
              One vision.
              <br />
              <em>Every dimension.</em>
            </h2>
          </div>
          <p>
            From the first sketch to the final detail,
            <br />
            we see the whole picture.
          </p>
        </div>
        <div className="expertise-list">
          {services.items.length ? (
            services.items.map((item, i) => (
              <Link href={`/services/${item.slug}`} key={item._id}>
                <span className="service-index">0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <ArrowUpRight strokeWidth={1} />
              </Link>
            ))
          ) : (
            <EmptyContent unavailable={services.unavailable} type="services" />
          )}
        </div>
      </section>
      <section className="process-section container">
        <Eyebrow number="05">FROM POSSIBILITY TO PLACE</Eyebrow>
        <h2>
          A clear process.
          <br />
          <em>An extraordinary outcome.</em>
        </h2>
        <Process />
      </section>
      {projects.items[0] && (
        <section className="project-story">
          <Picture
            src={projects.items[0].cover.url}
            alt={projects.items[0].cover.alt}
          />
          <div className="container">
            <Eyebrow>
              A CLOSER LOOK{" "}
              {projects.items[0].demo ? "/ FICTIONAL CONCEPT STUDY" : ""}
            </Eyebrow>
            <h2>{projects.items[0].title}</h2>
            <p>{projects.items[0].summary}</p>
            <TextLink href={`/projects/${projects.items[0].slug}`} light>
              Experience the project
            </TextLink>
          </div>
        </section>
      )}
      <section className="studio-principles container">
        <Eyebrow>WHAT WE BRING TO EVERY PROJECT</Eyebrow>
        <div>
          <h3>Human first.</h3>
          <h3>Place conscious.</h3>
          <h3>Detail driven.</h3>
        </div>
        <p>
          Our portfolio speaks through its spaces. Verified studio milestones
          and achievements will be shared here as the practice grows.
        </p>
      </section>
      {testimonials.items.length > 0 && (
        <section className="testimonials container">
          <Eyebrow>IN OUR CLIENTS’ WORDS</Eyebrow>
          {testimonials.items.map((item) => (
            <blockquote key={item._id}>
              <p>“{item.quote}”</p>
              <cite>
                {item.name} · {item.role}
                {item.demo ? " · Fictional demonstration" : ""}
              </cite>
            </blockquote>
          ))}
        </section>
      )}
      <section className="journal-section container">
        <div className="section-heading">
          <div>
            <Eyebrow number="06">THE JOURNAL</Eyebrow>
            <h2>
              Ideas. Observations.
              <br />
              <em>A different perspective.</em>
            </h2>
          </div>
          <TextLink href="/journal">Explore the journal</TextLink>
        </div>
        {articles.items.length ? (
          <div className="article-grid">
            {articles.items.map((item) => (
              <ArticleCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyContent unavailable={articles.unavailable} type="stories" />
        )}
      </section>
      <ConsultationCTA
        title={value(
          "ctaTitle",
          "A remarkable space begins\nwith a conversation.",
        )}
        text={value(
          "ctaText",
          "Tell us what you have in mind. We’ll explore what it could become.",
        )}
      />
    </>
  );
}
