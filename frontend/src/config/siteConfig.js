// ---------------------------------------------------------------------------
// Business details shown across the site (footer, contact page, policies).
// Everything the client still has to confirm is marked TODO(client) — fill
// these in and every page picks them up. Empty strings are simply hidden.
// ---------------------------------------------------------------------------

const siteConfig = {
  brandName: "GADCO ZEN",

  // Parent brand — shown as "Powered by Vama Clinic" in the header, footer,
  // home and about pages.
  poweredBy: {
    name: "Vama Clinic",
    url: "https://vamaclinics.com/",
  },

  // Bulk / B2B orders (clinics, hospitals, pharmacies) — /bulk-orders page.
  bulkOrders: {
    // Shown on the page; quotes are sent manually by the team.
    // TODO(client): confirm the minimum order and response time.
    minimumOrderNote: "Bulk pricing starts from 10 packs per product",
    responseTime: "within 1 business day",
    phone: "+91 93159 10949",
    // WhatsApp number in international format, digits only ("" hides the button)
    whatsapp: "919315910949",
  },

  legalName: "Vamah Advanced Hair And Skin LLP",
  address: "48B 48A, Kaushalpuri Colony, Chinhat, Chhota Bharwara, Lucknow, Uttar Pradesh - 226010",
  gstin: "09AAYFV3346C1ZQ",

  email: "info@vamasolution.com",
  phone: "+91 93159 10949",
  // TODO(client): confirm support hours
  businessHours: "Mon–Sat, 10:00 AM – 6:00 PM",

  // Grievance Officer — mandatory under the Consumer Protection (E-Commerce) Rules, 2020.
  // TODO(client): name of the person responsible for handling complaints
  grievanceOfficer: {
    name: "",
    email: "info@vamasolution.com",
    phone: "+91 93159 10949",
  },

  // TODO(client): real profile URLs (leave "" to hide the icon)
  social: {
    instagram: "https://www.instagram.com/gadcozen",
    facebook: "",
  },

  policies: {
    lastUpdated: "September 2026",
    returnWindowDays: 7,
    // Courier aggregator used for all deliveries and return pickups
    shippingPartner: "Shiprocket",
    refundProcessingDays: "5–7 business days",
    orderProcessingDays: "1–2 business days",
    deliveryEstimate: "3–7 business days for most locations in India",
    cancellationAllowedBefore: "the order is shipped",
    jurisdictionCity: "Lucknow",
  },
};

export default siteConfig;
