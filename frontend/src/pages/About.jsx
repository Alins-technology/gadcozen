import { useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

export default function About() {
  useEffect(() => {
    document.title = "About Us | GADCO ZEN";
  }, []);

  return (
    <div>
      <div className="bg-brand-50/60 py-14">
        <div className="container-app">
          <Breadcrumbs items={[{ label: "About Us" }]} />
          <h1 className="mt-3 font-display text-4xl text-ink-900">About GADCO ZEN</h1>
        </div>
      </div>

      <div className="container-app grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <SectionHeading align="left" eyebrow="Our Story" title="Simple, everyday skincare" />
          <p className="mt-4 text-sm leading-relaxed text-ink-700">
            GADCO ZEN was created around a simple idea: everyday skincare and personal care
            shouldn't be complicated. We focus on a small, considered collection of essentials —
            cleansers, moisturizers, sun care, and hair care — designed to fit easily into a daily
            routine.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-700">
            Every product page on this site lists exactly what's on the product packaging, so
            what you see is what you get. We keep our claims grounded in what our formulas
            actually do, and we're always working on making the range better.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl bg-brand-50"
        >
          <img
            src="/images/products/hair-growth-shampoo/hair-growth-shampoo.png"
            alt="GADCO ZEN Hair Growth Shampoo"
            className="mx-auto h-80 w-auto object-contain p-8"
          />
        </motion.div>
      </div>
    </div>
  );
}
