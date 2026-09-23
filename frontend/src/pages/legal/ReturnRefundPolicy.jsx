import LegalLayout from "../../components/LegalLayout.jsx";
import siteConfig from "../../config/siteConfig.js";

const { policies } = siteConfig;

export default function ReturnRefundPolicy() {
  return (
    <LegalLayout title="Return, Refund & Cancellation Policy" updated={policies.lastUpdated}>
      <p>
        We want you to be happy with your {siteConfig.brandName} purchase. This policy explains how
        cancellations, returns and refunds work.
      </p>

      <h3 className="font-display text-lg text-ink-900">Order Cancellation</h3>
      <p>
        You can cancel an order any time before {policies.cancellationAllowedBefore} by contacting
        us at {siteConfig.email} or {siteConfig.phone} with your order number. Orders that have
        already shipped cannot be cancelled, but may be returned as described below.
      </p>

      <h3 className="font-display text-lg text-ink-900">Return Eligibility</h3>
      <p>
        Unopened, unused products in their original, sealed packaging can be returned within{" "}
        {policies.returnWindowDays} days of delivery.
      </p>

      <h3 className="font-display text-lg text-ink-900">Non-Returnable Items</h3>
      <p>
        For hygiene and safety reasons, opened or used skincare and personal care products cannot
        be returned, unless the product is damaged, defective, expired or different from what you
        ordered.
      </p>

      <h3 className="font-display text-lg text-ink-900">Damaged, Defective or Wrong Products</h3>
      <p>
        If you receive a damaged, defective or incorrect product, contact us within 48 hours of
        delivery with your order number and photos/unboxing video. We will arrange a free
        replacement or a full refund.
      </p>

      <h3 className="font-display text-lg text-ink-900">How to Request a Return</h3>
      <p>
        Email {siteConfig.email} with your order number, the item(s) you want to return and the
        reason. We&apos;ll confirm eligibility and share pickup or return-shipping instructions.
      </p>

      <h3 className="font-display text-lg text-ink-900">Refunds</h3>
      <p>
        Once a cancellation is confirmed or a returned product passes inspection, the refund is
        initiated to the original payment method. Online payments are refunded through our payment
        partner (Razorpay) and usually reflect within {policies.refundProcessingDays}, depending on
        your bank. For Cash on Delivery orders, refunds are made by bank transfer/UPI to an account
        you provide. Shipping charges are non-refundable unless the return is due to our error.
      </p>

      <h3 className="font-display text-lg text-ink-900">Contact</h3>
      <p>
        Questions about returns or refunds? Reach us at {siteConfig.email} or {siteConfig.phone}
        {siteConfig.businessHours && ` (${siteConfig.businessHours})`}.
      </p>
    </LegalLayout>
  );
}
