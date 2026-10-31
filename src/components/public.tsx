import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { Content } from "@/types/content";
export function Eyebrow({
  children,
  number,
}: {
  children: React.ReactNode;
  number?: string;
}) {
  return (
    <div className="eyebrow">
      {number && <span className="section-number">{number}</span>}
      <span>{children}</span>
    </div>
  );
}
export function TextLink({
  href,
  children,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`text-link ${light ? "light" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={19} />
    </Link>
  );
}
export function Picture({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`picture ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, (max-width: 1200px) 80vw, 1400px"
        preload={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
export function ProjectCard({
  item,
  index = 0,
}: {
  item: Content;
  index?: number;
}) {
  return (
    <Link
      href={`/projects/${item.slug}`}
      className={`project-card project-${index % 4}`}
    >
      <div className="project-image">
        {item.cover?.url && (
          <Image
            src={item.cover.url}
            alt={item.cover.alt}
            fill
            sizes="(max-width: 700px) 100vw, 55vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <span className="project-arrow">
          <ArrowUpRight size={24} />
        </span>
        {item.demo && <span className="demo-badge">Concept study</span>}
      </div>
      <div className="project-caption">
        <div>
          <h3>{item.title}</h3>
          <p>{item.location || item.category}</p>
        </div>
        <span>
          {item.category}
          <br />
          {item.year}
        </span>
      </div>
    </Link>
  );
}
export function ArticleCard({ item }: { item: Content }) {
  return (
    <Link href={`/journal/${item.slug}`} className="article-card">
      {item.cover?.url && <Picture src={item.cover.url} alt={item.cover.alt} />}
      <div className="article-meta">
        {item.category}{" "}
        <span>
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Journal"}
        </span>
      </div>
      <h3>{item.title}</h3>
      <span className="article-read">
        Read story <ArrowUpRight size={18} />
      </span>
    </Link>
  );
}
export function ConsultationCTA({
  title = "A remarkable space begins\nwith a conversation.",
  text = "Tell us what you have in mind. We’ll explore what it could become.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="consultation-cta container">
      <Eyebrow>YOUR NEXT CHAPTER</Eyebrow>
      <div>
        <h2>{title}</h2>
        <Link
          href="/consultation"
          className="circle-link"
          aria-label="Start a project"
        >
          <ArrowUpRight size={40} strokeWidth={1} />
        </Link>
      </div>
      <p>{text}</p>
    </section>
  );
}
export function EmptyContent({
  unavailable,
  type = "work",
}: {
  unavailable?: boolean;
  type?: string;
}) {
  return (
    <div className="empty-state">
      <span className="mini-cross">+</span>
      <h3>
        {unavailable
          ? "The collection is temporarily unavailable."
          : `A new chapter of ${type} is taking shape.`}
      </h3>
      <p>
        {unavailable
          ? "Please try again shortly, or contact the studio to discuss your project."
          : "Our studio is preparing its next selection. In the meantime, let’s talk about your vision."}
      </p>
      <TextLink href="/contact">Contact the studio</TextLink>
    </div>
  );
}
export function PageHero({
  label,
  title,
  text,
  image,
}: {
  label: string;
  title: string;
  text?: string;
  image?: { url: string; alt: string };
}) {
  return (
    <section className={`page-hero ${image ? "with-image" : ""}`}>
      <div className="container">
        <Eyebrow>{label}</Eyebrow>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {image && <Picture src={image.url} alt={image.alt} priority />}
    </section>
  );
}
export function Process({
  stages = [
    "Listen & discover",
    "Imagine & explore",
    "Refine & resolve",
    "Create & deliver",
  ],
}: {
  stages?: string[];
}) {
  return (
    <div className="process-grid">
      {stages.map((stage, i) => (
        <div key={`${stage}-${i}`}>
          <span>
            0{i + 1} <ArrowRight size={18} />
          </span>
          <h3>{stage}</h3>
          <p>
            {
              [
                "Every project begins with understanding you, the place, and the possibilities.",
                "Ideas take shape through sketches, material studies, and a shared vision.",
                "We bring clarity to every detail, balancing beauty with the practical.",
                "We coordinate the design through delivery, keeping the original vision in view.",
              ][i % 4]
            }
          </p>
        </div>
      ))}
    </div>
  );
}
