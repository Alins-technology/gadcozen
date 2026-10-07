import { createContext, useContext, useEffect, useState } from "react";
import { fetchStoreConfig } from "../services/configService";

// Fallbacks match the backend defaults, so the UI is correct even before
// (or if) the /api/config request completes.
const defaultConfig = {
  freeShippingThreshold: 999,
  standardShipping: 79,
  codFee: 0,
  paymentMethods: ["cod"],
  razorpayKeyId: null,
  bulkDiscountPercent: 20,
  loaded: false,
};

const StoreConfigContext = createContext(defaultConfig);

export const StoreConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    fetchStoreConfig()
      .then((data) => setConfig({ ...defaultConfig, ...data, loaded: true }))
      .catch(() => setConfig((c) => ({ ...c, loaded: true })));
  }, []);

  return <StoreConfigContext.Provider value={config}>{children}</StoreConfigContext.Provider>;
};

export const useStoreConfig = () => useContext(StoreConfigContext);
