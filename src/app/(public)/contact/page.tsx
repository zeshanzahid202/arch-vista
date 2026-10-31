import { PageHero, TextLink } from "@/components/public";
import { ContactForm } from "@/features/forms/contact-form";
import { optionalValues } from "@/lib/content";
export const metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Begin a conversation with ArchVista about your architecture or interior design project.",
};
export default async function Contact() {
  let data: Record<string, unknown> = {};
  try {
    data = await optionalValues("settings", "studio");
  } catch {}
  const val = (k: string) =>
    typeof data[k] === "string" ? String(data[k]) : "";
  return (
    <>
      <PageHero
        label="LET’S BEGIN"
        title={"Great spaces start\nwith a conversation."}
        text="A question, an idea, or a vision waiting to take shape. We’d love to hear from you."
      />
      <section className="container contact-grid">
        <div className="contact-details">
          <div>
            <h3>Say hello.</h3>
            {val("email") ? (
              <a href={`mailto:${val("email")}`}>{val("email")}</a>
            ) : (
              <p>Use the form to reach the studio.</p>
            )}
            {val("phone") && (
              <p>
                <a href={`tel:${val("phone")}`}>{val("phone")}</a>
              </p>
            )}
          </div>
          <div>
            <h3>Find the studio.</h3>
            <p>{val("address") || "Studio visits by appointment."}</p>
          </div>
          <div>
            <h3>A project in mind?</h3>
            <p>Share a more detailed brief.</p>
            <TextLink href="/consultation">Book a consultation</TextLink>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
