import LegalLayout from "../../components/LegalLayout.jsx";
import siteConfig from "../../config/siteConfig.js";

const operator = siteConfig.legalName || siteConfig.brandName;
const { grievanceOfficer } = siteConfig;

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated={siteConfig.policies.lastUpdated}>
      <p>
        This Privacy Policy describes how {operator} (&quot;{siteConfig.brandName}&quot;,
        &quot;we&quot;, &quot;us&quot;) collects, uses and protects your personal information when
        you use this website, in line with the Digital Personal Data Protection Act, 2023 and other
        applicable Indian laws.
      </p>

      <h3 className="font-display text-lg text-ink-900">Information We Collect</h3>
      <p>
        We collect the information you give us — your name, email address, phone number, shipping
        address and order details — and basic technical data (such as browser type and pages
        visited) needed to run and secure the site.
      </p>

      <h3 className="font-display text-lg text-ink-900">Payments</h3>
      <p>
        Online payments are processed by our payment partner, Razorpay. Your card, UPI and bank
        details are entered on Razorpay&apos;s secure checkout and are never stored on our servers.
        Razorpay&apos;s own privacy policy applies to the payment information you share with them.
      </p>

      <h3 className="font-display text-lg text-ink-900">How We Use Your Information</h3>
      <p>
        To process and deliver your orders, send order and shipping updates, manage your account,
        respond to your questions, prevent fraud, and — only if you subscribe — send you news and
        offers. You can unsubscribe from marketing emails at any time.
      </p>

      <h3 className="font-display text-lg text-ink-900">Sharing Your Information</h3>
      <p>
        We share only what is necessary with service providers that help us run the store: our
        payment gateway, courier partners (name, address and phone for delivery), email provider
        and hosting providers. We do not sell your personal data.
      </p>

      <h3 className="font-display text-lg text-ink-900">Data Security & Retention</h3>
      <p>
        Passwords are stored using industry-standard hashing and all traffic is encrypted over
        HTTPS. We keep order records for as long as required by tax and accounting laws, and other
        data only for as long as needed for the purposes above.
      </p>

      <h3 className="font-display text-lg text-ink-900">Your Rights</h3>
      <p>
        You can view and update your details from your account, and you may request a copy,
        correction or deletion of your personal data by emailing {siteConfig.email}.
      </p>

      <h3 className="font-display text-lg text-ink-900">Grievance Officer</h3>
      <p>
        {grievanceOfficer.name && (
          <>
            {grievanceOfficer.name}
            <br />
          </>
        )}
        Email: {grievanceOfficer.email}
        {grievanceOfficer.phone && (
          <>
            <br />
            Phone: {grievanceOfficer.phone}
          </>
        )}
        {siteConfig.address && (
          <>
            <br />
            Address: {siteConfig.address}
          </>
        )}
      </p>
    </LegalLayout>
  );
}
