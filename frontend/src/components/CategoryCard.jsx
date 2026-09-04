import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CategoryCard({ category, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Link to={`/category/${category.slug}`} className="group block">
        <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-brand-50/70 shadow-sm transition-shadow duration-300 group-hover:shadow-card">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
              <span className="font-display text-3xl text-brand-300">{category.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 text-center">
          <h3 className="font-display text-sm text-ink-900 transition-colors group-hover:text-brand-700 sm:text-base">
            {category.name}
          </h3>
          {category.productCount != null && (
            <p className="mt-0.5 text-xs text-ink-500">
              {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
