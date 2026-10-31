import { PageHero } from "@/components/public";
export const metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <>
      <PageHero label="INFORMATION & TRUST" title="Privacy policy" />
      <article className="container legal">
        <p>
          This policy describes how ArchVista handles information submitted
          through this website. Effective October 31, 2026. The operating studio
          must review and complete this policy with its legal name, contact
          details, jurisdiction, and retention schedule before launch.
        </p>
        <h2>Information you provide</h2>
        <p>
          Contact and consultation forms collect your name, email, phone,
          project details, and consent. Newsletter requests collect your email
          and consent. Please do not submit sensitive personal information.
        </p>
        <h2>How information is used</h2>
        <p>
          We use project information to respond to inquiries, assess a proposed
          brief, and communicate with you. Newsletter information is used for
          requested editorial updates. We do not sell your information.
        </p>
        <h2>Storage and service providers</h2>
        <p>
          Records are stored in MongoDB. Website hosting, image delivery, and
          notification email may be processed by Vercel, Cloudinary, and the
          studio’s configured email provider. Depending on configuration, these
          services may process data in other countries.
        </p>
        <h2>Cookies and security</h2>
        <p>
          Administrator sessions use essential authentication cookies. The
          public website does not add advertising or analytics cookies by
          default. We apply access controls and validation to protect submitted
          information.
        </p>
        <h2>Retention and your choices</h2>
        <p>
          Data should be retained only as long as needed to respond to your
          request and meet applicable obligations. Contact the studio using the
          contact page to request access, correction, deletion, or withdrawal of
          consent. Newsletter consent may be withdrawn at any time through the
          studio.
        </p>
        <h2>Contact and changes</h2>
        <p>
          For privacy questions, use the contact form and mention “Privacy
          request.” Updated policies will be published on this page. This launch
          template requires studio-specific legal review.
        </p>
      </article>
    </>
  );
}
