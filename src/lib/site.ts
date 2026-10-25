export const SITE_NAME = "RedactMy.pics";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://redactmy.pics"
).replace(/\/+$/, "");

export const IS_LIVE = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

export const CONTACT_EMAIL = "jyao10086@gmail.com";
