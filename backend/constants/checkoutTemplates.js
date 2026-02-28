export const CHECKOUT_TEMPLATES = {
  uid_topup: {
    key: "uid_topup",
    label: "UID Top-Up",
    fields: [
      {
        fieldKey: "whatsapp_number",
        fieldName: "WhatsApp Number",
        fieldType: "tel",
        required: true,
        placeholder: "Enter WhatsApp number",
        options: [],
      },
      {
        fieldKey: "player_uid",
        fieldName: "Player UID",
        fieldType: "text",
        required: true,
        placeholder: "Enter Player UID",
        options: [],
      },
      {
        fieldKey: "zone_server",
        fieldName: "Zone/Server",
        fieldType: "dropdown",
        required: false,
        placeholder: "Select Zone/Server",
        options: [],
      },
    ],
  },
  login_topup: {
    key: "login_topup",
    label: "Login Top-Up",
    fields: [
      {
        fieldKey: "whatsapp_number",
        fieldName: "WhatsApp Number",
        fieldType: "tel",
        required: true,
        placeholder: "Enter WhatsApp number",
        options: [],
      },
      {
        fieldKey: "email_username",
        fieldName: "Email/Username",
        fieldType: "text",
        required: true,
        placeholder: "Enter Email or Username",
        options: [],
      },
      {
        fieldKey: "password",
        fieldName: "Password",
        fieldType: "password",
        required: true,
        placeholder: "Enter Password",
        options: [],
      },
      {
        fieldKey: "otp_method",
        fieldName: "OTP Method",
        fieldType: "dropdown",
        required: false,
        placeholder: "Select OTP Method",
        options: ["Email", "SMS", "Authenticator"],
      },
    ],
  },
  live_apps_topup: {
    key: "live_apps_topup",
    label: "Live Apps Top-Up",
    fields: [
      {
        fieldKey: "whatsapp_number",
        fieldName: "WhatsApp Number",
        fieldType: "tel",
        required: true,
        placeholder: "Enter WhatsApp number",
        options: [],
      },
      {
        fieldKey: "account_id",
        fieldName: "Phone / Account ID / Username",
        fieldType: "text",
        required: true,
        placeholder: "Enter Account ID",
        options: [],
      },
      {
        fieldKey: "extra_note",
        fieldName: "Extra Note",
        fieldType: "text",
        required: false,
        placeholder: "Any special instructions",
        options: [],
      },
    ],
  },
  gift_cards: {
    key: "gift_cards",
    label: "Gift Cards",
    fields: [
      {
        fieldKey: "whatsapp_number",
        fieldName: "WhatsApp Number",
        fieldType: "tel",
        required: true,
        placeholder: "Enter WhatsApp number",
        options: [],
      },
      {
        fieldKey: "email",
        fieldName: "Email to receive code",
        fieldType: "email",
        required: false,
        placeholder: "Enter email address",
        options: [],
      },
      {
        fieldKey: "region",
        fieldName: "Region",
        fieldType: "dropdown",
        required: false,
        placeholder: "Select Region",
        options: [],
      },
    ],
  },
  ai_subscriptions: {
    key: "ai_subscriptions",
    label: "AI & Subscriptions",
    fields: [
      {
        fieldKey: "whatsapp_number",
        fieldName: "WhatsApp Number",
        fieldType: "tel",
        required: true,
        placeholder: "Enter WhatsApp number",
        options: [],
      },
      {
        fieldKey: "email",
        fieldName: "Email",
        fieldType: "email",
        required: false,
        placeholder: "Enter email address",
        options: [],
      },
      {
        fieldKey: "notes",
        fieldName: "Notes",
        fieldType: "text",
        required: false,
        placeholder: "Additional notes",
        options: [],
      },
    ],
  },
};

export const CHECKOUT_TEMPLATE_KEYS = Object.keys(CHECKOUT_TEMPLATES);

export const CATEGORIES = [
  "uid instant top-up",
  "login top-up",
  "live apps top-up",
  "gift cards",
  "ai & subscriptions",
];

/** Slug → DB category name mapping */
export const CATEGORY_SLUG_MAP = {
  "uid-instant-top-up": "uid instant top-up",
  "login-top-up": "login top-up",
  "live-apps-top-up": "live apps top-up",
  "gift-cards": "gift cards",
  "ai-subscriptions": "ai & subscriptions",
};

/** Convert a URL slug back to the DB category name */
export const slugToCategory = (slug) => {
  return CATEGORY_SLUG_MAP[slug] || slug;
};
