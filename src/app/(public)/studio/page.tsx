import { StudioStory } from "@/features/studio/story";
export const metadata = {
  alternates: { canonical: "/studio" },
  title: "Inside the studio",
  description:
    "Explore our creative process, studio culture, and considered approach to design.",
};
export default function Studio() {
  return <StudioStory studio />;
}
