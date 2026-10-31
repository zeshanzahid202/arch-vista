import {
  PageHero,
  ConsultationCTA,
  ArticleCard,
  Eyebrow,
} from "@/components/public";
import { Collection } from "@/features/portfolio/collection";
import { publicList } from "@/lib/content";
export const metadata = {
  alternates: { canonical: "/journal" },
  title: "Journal",
  description:
    "Ideas and observations on architecture, materials, light, and how we live.",
};
export default async function Journal({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const featured = await publicList(
    "articles",
    new URLSearchParams({ featured: "true", limit: "1" }),
  );
  return (
    <>
      <PageHero
        label="THE JOURNAL"
        title={"A considered\npoint of view."}
        text="Stories from the studio. Notes on design. Observations on the way we inhabit the world."
      />
      {featured.items[0] && (
        <section className="container journal-feature">
          <Eyebrow>EDITOR’S SELECTION</Eyebrow>
          <ArticleCard item={featured.items[0]} />
        </section>
      )}
      <Collection type="articles" search={await searchParams} />
      <ConsultationCTA />
    </>
  );
}
