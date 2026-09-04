import LegalLayout from "../../components/LegalLayout.jsx";

export default function ReturnRefundPolicy() {
  return (
    <LegalLayout title="Return & Refund Policy">
      <p>
        We want you to be happy with your GADCO ZEN purchase. This policy explains how returns and
        refunds work.
      </p>
      <h3 className="font-display text-lg text-ink-900">Eligibility</h3>
      <p>
        Unopened, unused products in their original packaging may be eligible for return within
        [return window — placeholder, define before launch] of delivery.
      </p>
      <h3 className="font-display text-lg text-ink-900">Non-Returnable Items</h3>
      <p>
        For hygiene reasons, opened or used skincare and personal care products generally cannot
        be returned, except in the case of a manufacturing defect.
      </p>
      <h3 className="font-display text-lg text-ink-900">How to Request a Return</h3>
      <p>
        Contact us at vamaskinhair@gmail.com with your order number and reason for return, and
        we'll guide you through the next steps.
      </p>
      <h3 className="font-display text-lg text-ink-900">Refunds</h3>
      <p>
        Once a return is received and inspected, approved refunds are processed to the original
        payment method within [refund timeline — placeholder].
      </p>
    </LegalLayout>
  );
}
