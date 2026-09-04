import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | GADCO ZEN";
  }, []);

  return (
    <div className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600"
      >
        <Compass size={36} />
      </motion.div>
      <h1 className="mt-6 font-display text-5xl text-ink-900">404</h1>
      <p className="mt-2 text-lg text-ink-700">This page seems to have wandered off.</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
