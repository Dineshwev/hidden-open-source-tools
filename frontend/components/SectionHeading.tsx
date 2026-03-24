type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm uppercase tracking-[0.35em] text-aurora/70">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-white/65">{description}</p>
    </div>
  );
}
