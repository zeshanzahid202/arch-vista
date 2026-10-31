import { PageHero } from "@/components/public";
import { ConsultationForm } from "@/features/forms/consultation-form";
export const metadata = {
  alternates: { canonical: "/consultation" },
  title: "Start a project",
  description:
    "Tell ArchVista about your project, priorities, and vision in a few simple steps.",
};
export default function Consultation() {
  return (
    <>
      <PageHero
        label="YOUR NEXT CHAPTER"
        title={"Let’s explore\nwhat’s possible."}
        text="A few details help us understand your vision. Tell us about the space you want to create."
      />
      <div className="container">
        <ConsultationForm />
      </div>
    </>
  );
}
