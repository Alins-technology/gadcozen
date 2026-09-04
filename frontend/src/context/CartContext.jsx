import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  mergeCartApi,
  applyCouponApi,
  removeCouponApi,
} from "../services/cartService";
import { getErrorMessage } from "../services/api";

const CartContext = createContext(null);
const GUEST_CART_KEY = "gz_guest_cart"; // [{ product, quantity }]

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};
const writeGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 79;

const summarizeGuestCart = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = 0;
  const shippingCost = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = Math.max(subtotal - discount + shippingCost, 0);
  return {
    items: items.map((i) => ({ ...i, lineTotal: i.product.price * i.quantity })),
    subtotal,
    discount,
    shippingCost,
    total,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(summarizeGuestCart(readGuestCart()));
  const [loading, setLoading] = useState(false);
  const hasMerged = useRef(false);

  const refreshServerCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // On auth state change: merge guest cart into server cart (once), or load guest cart
  useEffect(() => {
    const run = async () => {
      if (isAuthenticated) {
        const guestItems = readGuestCart();
        if (guestItems.length && !hasMerged.current) {
          hasMerged.current = true;
          try {
            await mergeCartApi(
              guestItems.map((i) => ({ productId: i.product._id, quantity: i.quantity }))
            );
            writeGuestCart([]);
          } catch {
            // non-fatal
          }
        }
        await refreshServerCart();
      } else {
        hasMerged.current = false;
        setCart(summarizeGuestCart(readGuestCart()));
      }
    };
    run();
  }, [isAuthenticated, refreshServerCart]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated) {
        try {
          const data = await addToCartApi(product._id, quantity);
          setCart(data);
          return { success: true };
        } catch (err) {
          return { success: false, message: getErrorMessage(err) };
        }
      }
      const items = readGuestCart();
      const existing = items.find((i) => i.product._id === product._id);
      const stock = typeof product.stock === "number" ? product.stock : Infinity;
      const desiredTotal = (existing?.quantity || 0) + quantity;
      if (desiredTotal > stock) {
        return { success: false, message: "Not enough stock available" };
      }
      if (existing) existing.quantity = desiredTotal;
      else items.push({ product, quantity });
      writeGuestCart(items);
      setCart(summarizeGuestCart(items));
      return { success: true };
    },
    [isAuthenticated]
  );

  const updateItem = useCallback(
    async (productId, quantity) => {
      if (isAuthenticated) {
        const data = await updateCartItemApi(productId, quantity);
        setCart(data);
        return;
      }
      let items = readGuestCart();
      if (quantity <= 0) {
        items = items.filter((i) => i.product._id !== productId);
      } else {
        const item = items.find((i) => i.product._id === productId);
        if (item) item.quantity = quantity;
      }
      writeGuestCart(items);
      setCart(summarizeGuestCart(items));
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (isAuthenticated) {
        const data = await removeCartItemApi(productId);
        setCart(data);
        return;
      }
      const items = readGuestCart().filter((i) => i.product._id !== productId);
      writeGuestCart(items);
      setCart(summarizeGuestCart(items));
    },
    [isAuthenticated]
  );

  const clear = useCallback(async () => {
    if (isAuthenticated) {
      const data = await clearCartApi();
      setCart(data);
      return;
    }
    writeGuestCart([]);
    setCart(summarizeGuestCart([]));
  }, [isAuthenticated]);

  const applyCoupon = useCallback(
    async (code) => {
      if (!isAuthenticated) {
        return { success: false, message: "Please log in to apply a coupon code." };
      }
      try {
        const data = await applyCouponApi(code);
        setCart(data);
        return { success: true };
      } catch (err) {
        return { success: false, message: getErrorMessage(err) };
      }
    },
    [isAuthenticated]
  );

  const removeCoupon = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await removeCouponApi();
    setCart(data);
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        updateItem,
        removeItem,
        clear,
        applyCoupon,
        removeCoupon,
        refreshServerCart,
        isGuestCart: !isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
