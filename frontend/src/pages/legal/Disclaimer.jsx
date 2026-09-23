import LegalLayout from "../../components/LegalLayout.jsx";

export default function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer">
      <p>
        The content on this website, including product descriptions, is provided for general
        informational purposes and reflects the information present on GADCO ZEN product
        packaging.
      </p>
      <h3 className="font-display text-lg text-ink-900">Not Medical Advice</h3>
      <p>
        Nothing on this site constitutes medical or dermatological advice. If you have a skin
        condition, allergy, or medical concern, please consult a qualified professional before
        using any new product.
      </p>
      <h3 className="font-display text-lg text-ink-900">Patch Testing</h3>
      <p>We recommend patch-testing any new skincare or hair-care product before regular use.</p>
      <h3 className="font-display text-lg text-ink-900">Results May Vary</h3>
      <p>
        Individual results depend on skin and hair type, routine and other factors. Customer
        reviews reflect personal experiences and are not a guarantee of results.
      </p>
    </LegalLayout>
  );
}
