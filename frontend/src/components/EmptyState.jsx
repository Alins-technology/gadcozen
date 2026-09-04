import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, message, actionLabel, actionTo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center"
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-display text-xl text-ink-900">{title}</h3>
      {message && <p className="text-sm text-ink-500">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
