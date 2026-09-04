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
      <h3 className="font-display text-lg text-ink-900">Demo Content</h3>
      <p>
        This is a development storefront. Some content, such as customer reviews, may be marked as
        demo content for showcase purposes and does not represent real customer feedback.
      </p>
    </LegalLayout>
  );
}
