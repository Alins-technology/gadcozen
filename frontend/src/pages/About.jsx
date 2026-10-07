import { motion } from "framer-motion";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { imgProps } from "../utils/image.js";
import { Link } from "react-router-dom";
import { ExternalLink, Stethoscope } from "lucide-react";
import useSeo from "../hooks/useSeo.js";
import siteConfig from "../config/siteConfig.js";

export default function About() {
  useSeo({
    title: "About Us",
    description:
      "Meet GADCO ZEN, powered by Vama Clinic — simple, effective skincare, personal care and medical supplies for everyday routines and clinics.",
  });

  return (
    <div>
      <div className="bg-brand-50/60 py-14">
        <div className="container-app">
          <Breadcrumbs items={[{ label: "About Us" }]} />
          <h1 className="mt-3 font-display text-4xl text-ink-900">About GADCO ZEN</h1>
          <p className="mt-2 text-sm text-ink-500">
            Powered by{" "}
            <a href={siteConfig.poweredBy.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:underline">
              {siteConfig.poweredBy.name}
            </a>
          </p>
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
            {...imgProps("/images/products/hair-growth-shampoo/hair-growth-shampoo.png", 1200)}
            alt="GADCO ZEN Hair Growth Shampoo"
            className="mx-auto h-80 w-auto object-contain p-8"
          />
        </motion.div>
      </div>

      <div className="container-app pb-8">
        <div className="grid gap-6 rounded-3xl bg-brand-900 p-8 text-white sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <Stethoscope size={30} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              Powered by {siteConfig.poweredBy.name}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">Backed by clinic experience</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
              GADCO ZEN is powered by {siteConfig.poweredBy.name}. Alongside our skincare range we
              supply everyday medical consumables — syringes, surgical caps and face masks — to
              individuals, clinics, hospitals and pharmacies, per pack or in bulk.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={siteConfig.poweredBy.url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary !bg-white !text-brand-800 hover:!bg-brand-50"
              >
                Visit {siteConfig.poweredBy.name} <ExternalLink size={14} />
              </a>
              <Link to="/bulk-orders" className="btn border border-white/40 text-white hover:bg-white/10">
                Bulk Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
