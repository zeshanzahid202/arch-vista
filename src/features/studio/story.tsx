import {
  ConsultationCTA,
  Eyebrow,
  PageHero,
  Picture,
  Process,
} from "@/components/public";
import { publicList } from "@/lib/content";
export async function StudioStory({ studio = false }: { studio?: boolean }) {
  const team = await publicList("team");
  return (
    <>
      <PageHero
        label={studio ? "INSIDE THE STUDIO" : "THE ARCHVISTA STORY"}
        title={
          studio
            ? "A shared curiosity.\nA considered practice."
            : "Good architecture\nbegins with people."
        }
        text={
          studio
            ? "A place for ideas to be challenged, materials to be explored, and possibilities to become real."
            : "We believe a well-designed space can change the way you feel, the way you connect, and the way you live."
        }
        image={{
          url: studio
            ? "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=85"
            : "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
          alt: studio
            ? "An open, naturally lit collaborative studio space"
            : "A warm contemporary interior with natural materials",
        }}
      />
      <section className="container content-section split-content">
        <div>
          <Eyebrow number="01">
            {studio ? "THE WAY WE WORK" : "OUR POINT OF VIEW"}
          </Eyebrow>
          <h2>
            {studio
              ? "Open minds.\nThoughtful outcomes."
              : "A dialogue between\npeople and place."}
          </h2>
        </div>
        <div>
          <p>
            ArchVista is a contemporary architecture and interior design
            practice built around a simple idea: spaces should enrich the lives
            within them. We look for the essential character of every brief,
            every site, and every relationship.
          </p>
          <p>
            Our approach combines careful listening with a willingness to
            explore. We work across architecture, interiors, and spatial
            planning, connecting each decision to a coherent whole.
          </p>
          <p>
            We aim to make the process as considered as the result — clear
            communication, thoughtful choices, and a shared sense of direction.
          </p>
        </div>
      </section>
      <section className="container content-section">
        <Eyebrow number="02">THE VALUES THAT GUIDE US</Eyebrow>
        <div className="values-list">
          {[
            [
              "Human connection",
              "We begin with the people who will inhabit a place, and the everyday rituals that make it their own.",
            ],
            [
              "Material honesty",
              "We choose materials for their character, their performance, and the way they age.",
            ],
            [
              "Lasting relevance",
              "We pursue clarity and purpose over passing trends, designing for a life beyond the photograph.",
            ],
          ].map(([h, p]) => (
            <div key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="philosophy">
        <Picture
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85"
          alt="Tactile furnishings and soft light in a considered interior"
        />
        <div className="philosophy-content">
          <Eyebrow>OUR VISION</Eyebrow>
          <h2>
            Spaces with soul.
            <br />
            Design with purpose.
          </h2>
          <p>
            To create architecture that is grounded in its place, generous to
            its people, and thoughtful about its future. Our mission is to turn
            that ambition into a practical, collaborative design process.
          </p>
        </div>
      </section>
      <section className="container content-section">
        <Eyebrow number="03">OUR METHODOLOGY</Eyebrow>
        <h2 style={{ margin: "25px 0 45px" }}>
          Curiosity is our
          <br />
          starting point.
        </h2>
        <Process />
      </section>
      <section className="container content-section">
        <Eyebrow number="04">PEOPLE BEHIND THE PERSPECTIVE</Eyebrow>
        <h2 style={{ marginTop: 25 }}>A collective way of seeing.</h2>
        {team.items.length ? (
          <div className="team-grid">
            {team.items.map((t) => (
              <div key={t._id}>
                {t.cover && <Picture src={t.cover.url} alt={t.cover.alt} />}
                <h3>{t.name}</h3>
                <p>
                  {t.role}
                  {t.demo ? " · Fictional profile" : ""}
                </p>
                <p>{t.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 30 }}>
            Our team profiles are being prepared. Contact the studio to meet the
            people who will shape your project.
          </p>
        )}
      </section>
      <section className="container content-section">
        <Eyebrow>A PRACTICE IN PROGRESS</Eyebrow>
        <h2 style={{ marginTop: 25 }}>Building our next chapter.</h2>
        <div className="timeline">
          {[
            [
              "01",
              "Listen",
              "Every new relationship adds a perspective to our practice.",
            ],
            [
              "02",
              "Explore",
              "Every material study opens another possibility.",
            ],
            [
              "03",
              "Evolve",
              "Verified studio milestones will be published as the practice develops.",
            ],
          ].map(([n, h, p]) => (
            <div key={n}>
              <span className="service-index">{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <ConsultationCTA />
    </>
  );
}
