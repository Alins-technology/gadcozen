import LegalLayout from "../../components/LegalLayout.jsx";

export default function ShippingPolicy() {
  return (
    <LegalLayout title="Shipping Policy">
      <p>
        This Shipping Policy explains how GADCO ZEN (operated by [Business Legal Name —
        placeholder, update before launch]) processes and ships orders placed through this
        website.
      </p>
      <h3 className="font-display text-lg text-ink-900">Processing Time</h3>
      <p>Orders are typically processed within 1-2 business days of confirmation.</p>
      <h3 className="font-display text-lg text-ink-900">Shipping Charges</h3>
      <p>
        Shipping is free on orders above ₹999. Orders below this amount are charged a flat
        shipping fee, shown at checkout.
      </p>
      <h3 className="font-display text-lg text-ink-900">Delivery Estimates</h3>
      <p>
        Delivery timelines vary by location and courier partner. Exact estimates will be
        communicated once a courier partner is finalized.
      </p>
      <h3 className="font-display text-lg text-ink-900">Order Tracking</h3>
      <p>You can track your order status anytime from the Orders section of your account.</p>
      <h3 className="font-display text-lg text-ink-900">Contact</h3>
      <p>For shipping questions, reach us at vamaskinhair@gmail.com.</p>
    </LegalLayout>
  );
}
