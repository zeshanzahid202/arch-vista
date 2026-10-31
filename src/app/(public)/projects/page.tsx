import { PageHero, ConsultationCTA } from "@/components/public";
import { Collection } from "@/features/portfolio/collection";
export const metadata = {
  alternates: { canonical: "/projects" },
  title: "Selected work",
  description:
    "Explore architecture and interiors shaped around people, place, and possibility.",
};
export default async function Projects({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <>
      <PageHero
        label="THE PORTFOLIO"
        title={"Every place,\na new perspective."}
        text="An exploration of architecture, interiors, and the moments in between. Discover spaces with a story to tell."
      />
      <Collection type="projects" search={await searchParams} />
      <ConsultationCTA />
    </>
  );
}
