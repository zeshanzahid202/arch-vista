import { PageHero } from "@/components/public";
export const metadata = {
  title: "Terms and conditions",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  return (
    <>
      <PageHero label="WEBSITE INFORMATION" title="Terms & conditions" />
      <article className="container legal">
        <p>
          Effective October 31, 2026. These website terms are a launch template
          and must be reviewed by the operating studio with its legal identity,
          jurisdiction, and contact details before publication.
        </p>
        <h2>Using this website</h2>
        <p>
          Use this site lawfully and do not interfere with its operation,
          attempt unauthorized access, or submit harmful material. Content is
          provided for general information about the studio and its design
          approach.
        </p>
        <h2>Project inquiries</h2>
        <p>
          Submitting an inquiry or consultation brief does not establish an
          appointment, engagement, fee agreement, or obligation to provide
          services. Professional services begin only under a separate written
          agreement.
        </p>
        <h2>Content and imagery</h2>
        <p>
          Website design and editorial content may be protected by intellectual
          property rights. Photographs are subject to their respective licenses.
          Fictional demonstration projects and sample articles are labeled and
          do not represent completed client work or professional credentials.
        </p>
        <h2>Accuracy and external services</h2>
        <p>
          We aim to keep information accurate, but availability and details may
          change. Links and third-party services are governed by their own
          terms. Nothing on this site substitutes for site-specific professional
          advice.
        </p>
        <h2>Applicable rights</h2>
        <p>
          Nothing in these terms excludes rights or liability that cannot
          lawfully be excluded. Governing law and dispute terms must be
          completed by the studio before launch. Contact the studio with any
          questions about these terms.
        </p>
      </article>
    </>
  );
}
