import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchWishlist, addToWishlistApi, removeFromWishlistApi } from "../services/wishlistService";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchWishlist();
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (productId) => products.some((p) => p._id === productId),
    [products]
  );

  const toggle = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        return { success: false, message: "Please log in to save items to your wishlist." };
      }
      try {
        if (isWishlisted(product._id)) {
          const data = await removeFromWishlistApi(product._id);
          setProducts(data.products);
        } else {
          const data = await addToWishlistApi(product._id);
          setProducts(data.products);
        }
        return { success: true };
      } catch (err) {
        return { success: false, message: "Could not update your wishlist. Please try again." };
      }
    },
    [isAuthenticated, isWishlisted]
  );

  return (
    <WishlistContext.Provider value={{ products, loading, isWishlisted, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
};
