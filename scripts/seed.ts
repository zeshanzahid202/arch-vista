import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Project, Service, Article, Setting, SiteContent } from "../src/models";
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=85`;
const images = [
  photo("photo-1600607687920-4e2a09cf159d"),
  photo("photo-1600210492486-724fe5c67fb0"),
  photo("photo-1600607687939-ce8a6c25118c"),
  photo("photo-1616486338812-3dadae4b4ace"),
  photo("photo-1497366811353-6870744d04b2"),
  photo("photo-1600566753086-00f18fb6b3ea"),
];
const projects = [
  {
    title: "The Stillwater House",
    slug: "the-stillwater-house",
    location: "Kyoto, Japan · imagined site",
    category: "Residential",
    area: "420 m²",
    summary:
      "A quiet composition of timber, stone, and daylight. A fictional residence exploring the boundary between a garden and the home.",
  },
  {
    title: "Courtyard No. 08",
    slug: "courtyard-no-08",
    location: "Lisbon, Portugal · imagined site",
    category: "Interior",
    area: "285 m²",
    summary:
      "A study in warm minimalism, where generous daylight reveals a tactile palette of plaster, oak, and linen.",
  },
  {
    title: "Between the Pines",
    slug: "between-the-pines",
    location: "Oslo, Norway · imagined site",
    category: "Hospitality",
    area: "680 m²",
    summary:
      "An imagined retreat set lightly within a forest landscape. An exploration of shelter, rhythm, and the natural world.",
  },
  {
    title: "The Lightwell Studio",
    slug: "the-lightwell-studio",
    location: "Copenhagen, Denmark · imagined site",
    category: "Commercial",
    area: "960 m²",
    summary:
      "A fictional workspace conceived as a landscape of light, shared ideas, and purposeful places to pause.",
  },
  {
    title: "A Second Chapter",
    slug: "a-second-chapter",
    location: "London, United Kingdom · imagined site",
    category: "Renovation",
    area: "240 m²",
    summary:
      "An adaptive reuse concept that brings a contemporary clarity to the character of an existing building.",
  },
  {
    title: "A House for the Horizon",
    slug: "a-house-for-the-horizon",
    location: "Coastal landscape · imagined site",
    category: "Conceptual",
    area: "350 m²",
    summary:
      "A speculative study of a low-slung home shaped by the changing light of an open coastal horizon.",
  },
];
const serviceData = [
  [
    "Architecture",
    "architecture",
    "A complete architectural vision, grounded in place and shaped around the way you live.",
  ],
  [
    "Interior Design",
    "interior-design",
    "Tactile, thoughtful interiors that bring atmosphere and everyday rituals into focus.",
  ],
  [
    "Residential Design",
    "residential-design",
    "Individual homes that respond to your life, your landscape, and your aspirations.",
  ],
  [
    "Commercial Design",
    "commercial-design",
    "Spaces that express identity, support people, and help businesses move forward.",
  ],
  [
    "Renovation",
    "renovation",
    "A new perspective on existing spaces, connecting original character with contemporary life.",
  ],
  [
    "Spatial Planning",
    "spatial-planning",
    "Purposeful arrangements that unlock a place’s potential and make every square metre count.",
  ],
  [
    "Design Consultation",
    "design-consultation",
    "Focused advice to help clarify your priorities and give your project a confident direction.",
  ],
];
const articles = [
  [
    "The quiet power of natural materials",
    "the-quiet-power-of-natural-materials",
    "Materials",
    "On the beauty of honest materials, the patina of time, and spaces that become richer with use.",
  ],
  [
    "Designing with light, not just for it",
    "designing-with-light",
    "Perspectives",
    "How daylight can shape a room’s character, guide its rhythm, and connect a home to its setting.",
  ],
  [
    "The art of living with less",
    "the-art-of-living-with-less",
    "Living",
    "A considered approach to simplicity, where fewer elements make room for a fuller experience.",
  ],
];
async function main() {
  await connectDB();
  await Promise.all(
    [Project, Service, Article, Setting, SiteContent].map((m) => m.init()),
  );
  for (const [p, i] of projects.map((p, i) => [p, i] as const))
    await Project.updateOne(
      { slug: p.slug },
      {
        $setOnInsert: {
          ...p,
          status: "published",
          demo: true,
          featured: i < 4,
          order: i,
          year: 2026,
          cover: {
            url: images[i],
            alt: `Illustrative architectural photography for the fictional ${p.title} concept`,
          },
          gallery: [
            {
              url: images[(i + 1) % images.length],
              alt: "Illustrative interior photography, not documentation of a completed project",
            },
            {
              url: images[(i + 3) % images.length],
              alt: "Illustrative material and daylight study",
            },
          ],
          body: `<p><strong>Fictional demonstration project.</strong> This concept is included to demonstrate the ArchVista portfolio. The photographs are illustrative stock images, and this is not a claim of completed client work.</p><p>${p.summary}</p><h2>A dialogue with the landscape</h2><p>The proposal explores a sequence of open and intimate spaces. Framed views, soft transitions, and natural surfaces create a home that feels connected to its surroundings while offering places of quiet retreat.</p><p>A restrained material palette allows light to be the changing element throughout the day. The concept balances a clear architectural order with the texture and warmth of everyday life.</p>`,
          concept:
            "A sequence of calm spaces arranged around daylight and a connection to the landscape. Each threshold offers a different relationship between privacy and openness.",
          materials:
            "Natural oak, textured plaster, locally appropriate stone, linen, and bronze details form the imagined palette.",
          challenges:
            "The fictional brief explores the balance between openness and privacy, with particular attention to changing daylight and flexible ways of inhabiting a space.",
          solution:
            "A series of carefully proportioned volumes uses sheltered edges, framed views, and a legible circulation route to connect the whole.",
        },
      },
      { upsert: true },
    );
  for (const [s, i] of serviceData.map((s, i) => [s, i] as const))
    await Service.updateOne(
      { slug: s[1] },
      {
        $setOnInsert: {
          title: s[0],
          slug: s[1],
          summary: s[2],
          status: "published",
          demo: true,
          order: i,
          cover: {
            url: images[i % images.length],
            alt: `Illustrative ${s[0].toLowerCase()} photography`,
          },
          body: `<p>${s[2]}</p><p>We begin with your priorities and a careful reading of the existing context. Through discussion, sketches, and material exploration, we establish a shared direction before resolving the details.</p><h2>A connected approach</h2><p>Our process is collaborative and transparent. Scope, deliverables, consultant responsibilities, and fees are agreed in a tailored written proposal before professional services begin.</p>`,
          benefits: [
            "A clear, personal brief",
            "A coherent design vision",
            "Considered material choices",
            "A collaborative process",
          ],
          stages: [
            "Discover the brief",
            "Explore the possibilities",
            "Develop the details",
            "Coordinate the delivery",
          ],
          faqs: [
            {
              question: "How do we begin?",
              answer:
                "Share your project through the consultation form. We will review the brief and arrange an initial conversation.",
            },
            {
              question: "How is the scope agreed?",
              answer:
                "After discussing your priorities, we prepare a written proposal covering services, responsibilities, deliverables, and fees.",
            },
          ],
        },
      },
      { upsert: true },
    );
  for (const [a, i] of articles.map((a, i) => [a, i] as const))
    await Article.updateOne(
      { slug: a[1] },
      {
        $setOnInsert: {
          title: a[0],
          slug: a[1],
          category: a[2],
          summary: a[3],
          status: "published",
          demo: true,
          featured: i === 0,
          order: i,
          author: "ArchVista — sample editorial",
          publishedAt: new Date("2026-10-01T12:00:00Z"),
          tags: ["design", "architecture", a[2].toLowerCase()],
          cover: {
            url: images[(i + 2) % images.length],
            alt: `Illustrative photograph accompanying ${a[0]}`,
          },
          body: `<p><em>Fictional editorial sample created to demonstrate the journal.</em></p><p>${a[3]}</p><h2>Start with the experience</h2><p>A room is more than the sum of its elements. The way light falls across a surface, the weight of a handle, and the relationship between an opening and a view all contribute to its character.</p><p>Thoughtful design begins by noticing these ordinary moments. A material can invite touch. A well-placed window can turn a passing hour into something memorable. A clear plan can make everyday movement feel effortless.</p><blockquote><p>The most enduring spaces leave room for life to happen.</p></blockquote><h2>Make room for time</h2><p>We consider how spaces might change. A surface may develop a patina, a family’s needs may evolve, and the meaning of a room may shift. A coherent design makes space for that future without losing its essential character.</p><p>Our interest lies in creating a framework for living: clear enough to offer direction, and generous enough to welcome the unexpected.</p>`,
        },
      },
      { upsert: true },
    );
  await Setting.updateOne(
    { key: "studio" },
    {
      $setOnInsert: {
        key: "studio",
        value: {
          name: "ArchVista",
          address: "Studio visits by appointment",
          description:
            "Thoughtful architecture, considered interiors, and timeless spaces.",
        },
      },
    },
    { upsert: true },
  );
  await SiteContent.updateOne(
    { key: "home" },
    {
      $setOnInsert: {
        key: "home",
        value: {
          heroTitle: "Spaces that inspire.\nDesign that endures.",
          heroSubtitle:
            "Thoughtfully imagined. Beautifully lived.\nWe create architecture that connects people,\nplace, and possibility.",
          heroImage: images[0],
          heroAlt:
            "Illustrative warm contemporary interior opening toward a garden",
        },
      },
    },
    { upsert: true },
  );
  console.log(
    "Seed complete: 6 fictional concept projects, 7 sample services, 3 fictional articles. Existing content was preserved. No testimonials, credentials, awards, or client claims were invented.",
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
