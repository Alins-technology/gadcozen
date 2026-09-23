import { useStoreConfig } from "../context/StoreConfigContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function AnnouncementBar() {
  const { freeShippingThreshold } = useStoreConfig();
  return (
    <div className="w-full bg-brand-900 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-[13px]">
      Free Shipping on Orders Above {formatPrice(freeShippingThreshold)} · Use code{" "}
      <span className="font-semibold text-brand-100">WELCOME10</span> for 10% off your first order
    </div>
  );
}
