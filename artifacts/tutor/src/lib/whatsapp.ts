// Helpers for WhatsApp click-to-chat and share links (wa.me).
// - shareUrl: share a message/link to any contact (no destination number needed)
// - chatUrl:  open a chat with a specific number (used for contact/support/pay help)

export const SITE_URL = "https://www.dorothymooka.com/";

// Strip everything but digits; wa.me needs the full international number, no "+".
export function waNumber(raw?: string): string {
  return (raw || "").replace(/[^\d]/g, "");
}

export function shareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function chatUrl(number: string | undefined, text: string): string {
  const n = waNumber(number);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : shareUrl(text);
}

// Ready-made messages.
export const SHARE_COURSE = `I'm learning how to care for a loved one at home with "A Guide to Homecare" by Dr Dorothy Mooka — a free AI tutor, Nurse Mooka, that teaches through real situations. Your first topic is free: ${SITE_URL}`;

export const shareTopic = (title: string) =>
  `I'm learning "${title}" on A Guide to Homecare, a free caregiving tutor by Dr Dorothy Mooka. Try it: ${SITE_URL}`;

export const CONTACT_MSG = "Hello, I'd like to know more about A Guide to Homecare.";
export const PARTNER_MSG = "Hello, I'd like to talk about a partnership / organizational use of A Guide to Homecare.";
export const payHelpMsg = (country?: string) =>
  `Hello, I'd like to unlock the full A Guide to Homecare course${country ? ` (I'm in ${country})` : ""}. Please help me pay and get an unlock code.`;
