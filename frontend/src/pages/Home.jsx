import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Truck, HeadphonesIcon, ArrowRight } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import CategoryCard from "../components/CategoryCard.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { fetchProducts, fetchCategories } from "../services/productService.js";

const trustItems = [
  { icon: Sparkles, title: "Quality Focused", description: "Everyday formulas made with care." },
  { icon: ShieldCheck, title: "Secure Checkout", description: "Your data and payments stay protected." },
  { icon: Truck, title: "Easy Shopping", description: "A simple, no-fuss ordering experience." },
  { icon: HeadphonesIcon, title: "Customer Support", description: "Here to help with any questions." },
];

const demoTestimonials = [
  {
    name: "Verified Shopper",
    rating: 5,
    text: "The face wash has become part of my daily routine — light, refreshing, and easy to use. (Demo review)",
  },
  {
    name: "Verified Shopper",
    rating: 5,
    text: "Loved how lightweight the sunscreen feels under makeup, no white cast at all. (Demo review)",
  },
  {
    name: "Verified Shopper",
    rating: 4,
    text: "The moisturizing cream absorbs quickly and doesn't feel heavy. (Demo review)",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "GADCO ZEN | Skincare That Feels As Good As It Looks";
    const load = async () => {
      setLoading(true);
      try {
        const [featuredRes, bestRes, catRes] = await Promise.all([
          fetchProducts({ featured: true, limit: 4 }),
          fetchProducts({ bestseller: true, limit: 4 }),
          fetchCategories(),
        ]);
        setFeatured(featuredRes.products);
        setBestsellers(bestRes.products);
        setCategories(catRes.categories);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
        </div>

        <div className="container-app relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
              Glow With GADCO ZEN
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Skincare that feels as good as it looks.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-700">
              Discover simple, effective personal care designed to fit effortlessly into your
              everyday routine.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="btn-outline">
                Explore Products
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative mx-auto aspect-square w-full max-w-[16rem] sm:max-w-[19rem]"
          >
            {/* back card — rotated color tile, corners peek past the front card */}
            <div className="absolute inset-0 z-0 translate-x-5 translate-y-6 rotate-[12deg] rounded-[2rem] bg-brand-300/80" />

            {/* second product — clearly peeking out at the top-right corner */}
            <div className="absolute -right-7 -top-7 z-10 w-[58%] rotate-[16deg] overflow-hidden rounded-[1.5rem] border-4 border-white shadow-card sm:-right-9 sm:-top-9">
              <img
                src="/images/products/hair-growth-shampoo/hair-growth-shampoo.png"
                alt="GADCO ZEN Hair Growth Shampoo"
                className="aspect-square w-full object-cover"
              />
            </div>

            {/* front card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 z-20 -translate-x-4 translate-y-3 overflow-hidden rounded-[2rem] border-4 border-white shadow-card"
            >
              <img
                src="/images/products/fusion-sunscreen/fusion-sunscreen.png"
                alt="GADCO ZEN Fusion Sunscreen"
                className="aspect-square w-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
              className="absolute -left-5 -top-5 z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white text-center shadow-card sm:-left-7 sm:-top-7 sm:h-24 sm:w-24"
            >
              <span className="font-display text-lg font-semibold text-brand-700 sm:text-xl">10%</span>
              <span className="text-[9px] font-medium uppercase tracking-wide text-ink-500 sm:text-[10px]">
                Off First Order
              </span>
            </motion.div>

            <span
              className="absolute -bottom-4 left-10 z-30 h-3 w-3 animate-floaty rounded-full bg-brand-300"
              style={{ animationDelay: "0.8s" }}
            />
            <span
              className="absolute -right-3 bottom-16 z-30 h-2 w-2 animate-floaty rounded-full bg-brand-400"
              style={{ animationDelay: "1.6s" }}
            />
          </motion.div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-brand-100 bg-white py-10">
        <div className="container-app grid grid-cols-2 gap-6 sm:grid-cols-4">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <item.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="hidden text-xs text-ink-500 sm:block">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="container-app py-16 sm:py-20">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          description="Four simple categories built around your everyday routine."
        />
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat._id} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-brand-50/50 py-16 sm:py-20">
        <div className="container-app">
          <div className="flex items-end justify-between">
            <SectionHeading
              align="left"
              eyebrow="Handpicked"
              title="Featured Products"
              description="A closer look at the essentials people reach for most."
            />
            <Link
              to="/shop"
              className="hidden items-center gap-1 text-sm font-medium text-brand-700 hover:underline sm:flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featured} loading={loading} />
          </div>
        </div>
      </section>

      {/* PROMOTIONAL BANNER */}
      <section className="container-app py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute -top-10 right-0 h-56 w-56 rounded-full bg-brand-600/40 blur-3xl" />
          <h2 className="relative font-display text-2xl text-white sm:text-3xl">
            Your everyday skincare, simplified.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-white/70">
            Discover GADCO ZEN essentials designed for a simple, refreshing routine.
          </p>
          <Link to="/shop" className="btn-primary relative mt-6 !bg-white !text-brand-800 hover:!bg-brand-50">
            Explore the Collection <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* WHY GADCO ZEN */}
      <section className="container-app grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-brand-50"
        >
          <img
            src="/images/products/body-moisturizing-lotion/body-moisturizing-lotion.png"
            alt="GADCO ZEN Body Moisturizing Lotion"
            className="mx-auto h-80 w-auto object-contain p-8"
          />
        </motion.div>
        <div>
          <SectionHeading align="left" eyebrow="Our Philosophy" title="Why GADCO ZEN" />
          <ul className="mt-6 space-y-4 text-sm text-ink-700">
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
              Simple routines built around a small set of everyday essentials.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
              Thoughtful formulations, presented clearly with no unnecessary steps.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
              A clean, easy shopping experience from browsing to checkout.
            </li>
          </ul>
        </div>
      </section>

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <section className="bg-brand-50/50 py-16 sm:py-20">
          <div className="container-app">
            <SectionHeading eyebrow="Loved by customers" title="Bestsellers" />
            <div className="mt-10">
              <ProductGrid products={bestsellers} loading={false} />
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="container-app py-16 sm:py-20">
        <SectionHeading eyebrow="Demo Content" title="Customer Reviews" description="Shown here as demo placeholder reviews." />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {demoTestimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft"
            >
              <RatingStars rating={t.rating} />
              <p className="mt-3 text-sm text-ink-700">{t.text}</p>
              <p className="mt-4 text-xs font-medium text-ink-500">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
