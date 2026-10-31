import { StudioStory } from "@/features/studio/story";
export const metadata = {
  alternates: { canonical: "/about" },
  title: "Our story",
  description: "The people, values, and philosophy behind ArchVista.",
};
export default function About() {
  return <StudioStory />;
}
