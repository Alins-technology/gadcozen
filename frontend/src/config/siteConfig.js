// ---------------------------------------------------------------------------
// Business details shown across the site (footer, contact page, policies).
// Everything the client still has to confirm is marked TODO(client) — fill
// these in and every page picks them up. Empty strings are simply hidden.
// ---------------------------------------------------------------------------

const siteConfig = {
  brandName: "GADCO ZEN",

  // TODO(client): registered legal name of the business (as on GST / bank account)
  legalName: "",
  // TODO(client): full registered business address (required by Razorpay & e-commerce rules)
  address: "",
  // TODO(client): GSTIN, if registered
  gstin: "",

  email: "vamaskinhair@gmail.com",
  phone: "+91 93159 10949",
  // TODO(client): confirm support hours
  businessHours: "Mon–Sat, 10:00 AM – 6:00 PM",

  // Grievance Officer — mandatory under the Consumer Protection (E-Commerce) Rules, 2020.
  // TODO(client): name of the person responsible for handling complaints
  grievanceOfficer: {
    name: "",
    email: "vamaskinhair@gmail.com",
    phone: "+91 93159 10949",
  },

  // TODO(client): real profile URLs (leave "" to hide the icon)
  social: {
    instagram: "",
    facebook: "",
  },

  policies: {
    lastUpdated: "September 2026",
    // TODO(client): confirm all of the below
    returnWindowDays: 7,
    refundProcessingDays: "5–7 business days",
    orderProcessingDays: "1–2 business days",
    deliveryEstimate: "3–7 business days for most locations in India",
    cancellationAllowedBefore: "the order is shipped",
    jurisdictionCity: "New Delhi",
  },
};

export default siteConfig;
