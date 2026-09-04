import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={align === "center" ? "mx-auto max-w-xl text-center" : "max-w-xl"}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm text-ink-500 sm:text-base">{description}</p>}
    </motion.div>
  );
}
