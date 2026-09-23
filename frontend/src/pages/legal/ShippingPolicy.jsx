import LegalLayout from "../../components/LegalLayout.jsx";
import siteConfig from "../../config/siteConfig.js";
import { useStoreConfig } from "../../context/StoreConfigContext.jsx";
import { formatPrice } from "../../utils/format.js";

const { policies } = siteConfig;
const operator = siteConfig.legalName || siteConfig.brandName;

export default function ShippingPolicy() {
  const { freeShippingThreshold, standardShipping, codFee, paymentMethods } = useStoreConfig();

  return (
    <LegalLayout title="Shipping Policy" updated={policies.lastUpdated}>
      <p>
        This Shipping Policy explains how {siteConfig.brandName} (operated by {operator}) processes
        and delivers orders placed through this website. We currently ship within India only.
      </p>
      <h3 className="font-display text-lg text-ink-900">Processing Time</h3>
      <p>
        Orders are processed and dispatched within {policies.orderProcessingDays} of confirmation
        (excluding Sundays and public holidays). You will receive an email with tracking details
        once your order ships.
      </p>
      <h3 className="font-display text-lg text-ink-900">Delivery Time</h3>
      <p>
        Delivery usually takes {policies.deliveryEstimate} after dispatch. Remote areas may take
        longer. Delays caused by the courier, weather or other events outside our control may
        occasionally occur.
      </p>
      <h3 className="font-display text-lg text-ink-900">Shipping Charges</h3>
      <p>
        Shipping is free on orders of {formatPrice(freeShippingThreshold)} or more. Orders below
        this amount carry a flat shipping fee of {formatPrice(standardShipping)}, shown at checkout
        before you pay.
        {paymentMethods.includes("cod") && codFee > 0 &&
          ` Cash on Delivery orders carry an additional ${formatPrice(codFee)} COD fee.`}
      </p>
      <h3 className="font-display text-lg text-ink-900">Order Tracking</h3>
      <p>
        Track your order anytime from the Orders section of your account. Courier and tracking
        numbers are added there as soon as your parcel is handed over.
      </p>
      <h3 className="font-display text-lg text-ink-900">Damaged or Missing Parcels</h3>
      <p>
        If your parcel arrives damaged or tampered with, please record an unboxing video/photos and
        contact us within 48 hours of delivery so we can arrange a replacement or refund.
      </p>
      <h3 className="font-display text-lg text-ink-900">Contact</h3>
      <p>
        For shipping questions, email {siteConfig.email} or call {siteConfig.phone}.
      </p>
    </LegalLayout>
  );
}
