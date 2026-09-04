import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, User, Heart, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo.jsx";
import SearchOverlay from "./SearchOverlay.jsx";
import CartDrawer from "./CartDrawer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { products: wishlistProducts } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-soft backdrop-blur-md" : "bg-white/70 backdrop-blur-sm"
        }`}
      >
        <div className="container-app flex h-16 items-center justify-between sm:h-[72px]">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-full p-2 text-ink-900 hover:bg-brand-50"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>

          <Logo />

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative py-1 text-sm font-medium transition-colors ${
                    isActive ? "text-brand-700" : "text-ink-700 hover:text-brand-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-underline"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-brand-600"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-ink-900 transition-colors hover:bg-brand-50"
              aria-label="Search"
            >
              <Search size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(isAuthenticated ? "/account" : "/login")}
              className="hidden rounded-full p-2 text-ink-900 transition-colors hover:bg-brand-50 sm:inline-flex"
              aria-label="Account"
            >
              <User size={20} />
            </motion.button>
            <Link
              to="/wishlist"
              className="relative hidden rounded-full p-2 text-ink-900 transition-colors hover:bg-brand-50 sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistProducts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                  {wishlistProducts.length}
                </span>
              )}
            </Link>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2 text-ink-900 transition-colors hover:bg-brand-50"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cart.itemCount > 0 && (
                <motion.span
                  key={cart.itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white"
                >
                  {cart.itemCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[93] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-900/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-6 shadow-card"
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1.5 hover:bg-brand-50"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-3 text-sm font-medium ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-brand-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink-700 hover:bg-brand-50"
                >
                  Wishlist
                </NavLink>
                <NavLink
                  to={isAuthenticated ? "/account" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink-700 hover:bg-brand-50"
                >
                  {isAuthenticated ? "My Account" : "Login / Register"}
                </NavLink>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
