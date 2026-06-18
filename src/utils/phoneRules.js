// src/utils/phoneRules.js
export const PHONE_RULES = {
  IN: { digits: 10, label: "India", example: "9876543210" },
  SG: { digits: 8, label: "Singapore", example: "81234567" },
  US: { digits: 10, label: "USA", example: "4155552671" },
  AE: { digits: 9, label: "UAE", example: "501234567" },
  GB: { digits: 10, label: "UK", example: "7911123456" },
  MY: { digits: 9, label: "Malaysia", example: "123456789" },
  AU: { digits: 9, label: "Australia", example: "412345678" },
};

export function validatePhone(phone, countryCode) {
  if (!phone) return { valid: false, reason: "Phone number is empty" };
  const digits = String(phone).replace(/\D/g, "");
  const rule = PHONE_RULES[countryCode];
  if (!rule) return { valid: false, reason: `Unknown country code: ${countryCode}` };
  if (digits.length !== rule.digits) {
    return {
      valid: false,
      reason: `${rule.label} phone must be ${rule.digits} digits, got ${digits.length}`,
    };
  }
  return { valid: true, reason: null };
}