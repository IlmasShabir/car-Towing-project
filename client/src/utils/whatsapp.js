// Business WhatsApp number (used across Hero, Footer, and now form submissions)
export const WHATSAPP_NUMBER = '+971586729393';

/**
 * Builds a wa.me link pre-filled with the submitted form details.
 * Opening this lets the customer send the request straight to the
 * business's WhatsApp with one tap - no paid WhatsApp API needed.
 */
export const buildWhatsAppLink = (fields) => {
  const lines = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  const text = encodeURIComponent(`New Tow Request\n${lines}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
};
