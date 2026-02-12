export const CHECKOUT_TEMPLATES = {
  uid_topup: {
    key: "uid_topup",
    label: "UID Top-Up",
    fields: [
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
        fieldKey: "delivery_method",
        fieldName: "Delivery Method",
        fieldType: "dropdown",
        required: true,
        placeholder: "Select Delivery Method",
        options: [
          "Send account details",
          "Invite to email",
          "Activate on existing account",
        ],
      },
      {
        fieldKey: "email",
        fieldName: "Email",
        fieldType: "email",
        required: false,
        placeholder: "Enter email (if invite)",
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
