import LegalLayout from "../../components/LegalLayout.jsx";

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions">
      <p>
        By using this website and purchasing from GADCO ZEN, you agree to the following terms and
        conditions.
      </p>
      <h3 className="font-display text-lg text-ink-900">Use of This Site</h3>
      <p>
        This site is intended for personal, non-commercial use. You agree not to misuse the site
        or attempt to disrupt its normal operation.
      </p>
      <h3 className="font-display text-lg text-ink-900">Product Information</h3>
      <p>
        We aim to display product information accurately, based on the information present on
        product packaging. Minor variations may occur between batches.
      </p>
      <h3 className="font-display text-lg text-ink-900">Pricing & Availability</h3>
      <p>Prices and product availability are subject to change without prior notice.</p>
      <h3 className="font-display text-lg text-ink-900">Limitation of Liability</h3>
      <p>
        GADCO ZEN is not liable for indirect or incidental damages arising from the use of this
        site or its products, to the extent permitted by law.
      </p>
      <h3 className="font-display text-lg text-ink-900">Governing Law</h3>
      <p>These terms are governed by the laws of [Jurisdiction — placeholder, update before launch].</p>
    </LegalLayout>
  );
}
