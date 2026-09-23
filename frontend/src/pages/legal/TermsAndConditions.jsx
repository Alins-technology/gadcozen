import { Link } from "react-router-dom";
import LegalLayout from "../../components/LegalLayout.jsx";
import siteConfig from "../../config/siteConfig.js";

const operator = siteConfig.legalName || siteConfig.brandName;
const { grievanceOfficer, policies } = siteConfig;

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions" updated={policies.lastUpdated}>
      <p>
        This website is operated by {operator}
        {siteConfig.address && `, ${siteConfig.address}`}
        {siteConfig.gstin && ` (GSTIN: ${siteConfig.gstin})`}. By using this website or placing an
        order, you agree to these terms.
      </p>

      <h3 className="font-display text-lg text-ink-900">Use of This Site</h3>
      <p>
        You must be at least 18 years old, or use the site under the supervision of a parent or
        guardian. You agree to provide accurate information and not to misuse the site or attempt
        to disrupt its normal operation.
      </p>

      <h3 className="font-display text-lg text-ink-900">Product Information</h3>
      <p>
        We aim to display product information accurately, based on the information on product
        packaging. Minor variations in colour or packaging may occur between batches. Always read
        the label and patch-test before use.
      </p>

      <h3 className="font-display text-lg text-ink-900">Pricing & Payment</h3>
      <p>
        All prices are in Indian Rupees (INR) and inclusive of applicable taxes. Prices and
        availability may change without notice, but the price shown at checkout is the price you
        pay. Online payments are processed securely by Razorpay. We may cancel an order in case of
        pricing errors, stock unavailability or suspected fraud, and will refund any amount paid in
        full.
      </p>

      <h3 className="font-display text-lg text-ink-900">Orders, Shipping & Returns</h3>
      <p>
        An order is confirmed once you receive an order confirmation. Shipping, cancellations,
        returns and refunds are governed by our{" "}
        <Link to="/shipping-policy" className="text-brand-700 underline">
          Shipping Policy
        </Link>{" "}
        and{" "}
        <Link to="/return-refund-policy" className="text-brand-700 underline">
          Return, Refund &amp; Cancellation Policy
        </Link>
        .
      </p>

      <h3 className="font-display text-lg text-ink-900">Intellectual Property</h3>
      <p>
        All content on this site, including the {siteConfig.brandName} name, logo, images and text,
        belongs to {operator} and may not be used without permission.
      </p>

      <h3 className="font-display text-lg text-ink-900">Limitation of Liability</h3>
      <p>
        To the extent permitted by law, {siteConfig.brandName} is not liable for indirect or
        incidental damages arising from the use of this site or its products. Our total liability
        for any order is limited to the amount paid for that order.
      </p>

      <h3 className="font-display text-lg text-ink-900">Governing Law</h3>
      <p>
        These terms are governed by the laws of India. Any disputes are subject to the exclusive
        jurisdiction of the courts at {policies.jurisdictionCity}.
      </p>

      <h3 className="font-display text-lg text-ink-900">Grievance Redressal</h3>
      <p>
        For any complaint, contact our Grievance Officer
        {grievanceOfficer.name && `, ${grievanceOfficer.name}`}, at {grievanceOfficer.email}
        {grievanceOfficer.phone && ` / ${grievanceOfficer.phone}`}. We acknowledge complaints within
        48 hours and aim to resolve them within one month.
      </p>
    </LegalLayout>
  );
}
