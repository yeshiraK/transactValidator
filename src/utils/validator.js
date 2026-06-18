// src/utils/validator.js
import { PHONE_RULES } from "./phoneRules";

export const DATE_FORMATS = {
  "YYYY-MM-DD": /^\d{4}-\d{2}-\d{2}$/,
  "DD/MM/YYYY": /^\d{2}\/\d{2}\/\d{4}$/,
  "MM/DD/YYYY": /^\d{2}\/\d{2}\/\d{4}$/,
  "DD-MM-YYYY": /^\d{2}-\d{2}-\d{4}$/,
  "YYYY/MM/DD": /^\d{4}\/\d{2}\/\d{2}$/,
};

// Accepts HH:mm:ss AND HH:mm (both valid)
export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

function buildPhoneMap(countryRules = []) {
  const map = {};
  // Start with defaults
  Object.entries(PHONE_RULES).forEach(([code, rule]) => { map[code] = rule.digits; });
  // Override/add with user-configured rules
  countryRules.forEach(r => { map[String(r.code).toUpperCase()] = parseInt(r.digits); });
  return map;
}

function matchesAnyDateFormat(value, formats = []) {
  const str = String(value).trim();
  for (const fmt of formats) {
    const pattern = DATE_FORMATS[fmt];
    if (pattern && pattern.test(str)) return { matched: true, format: fmt };
  }
  return { matched: false, format: null };
}

function isRealDate(str, format) {
  let y, m, d;
  const clean = str.replace(/\//g, "-");
  const parts = clean.split("-");
  if (!format) return true;
  if (format.startsWith("YYYY")) { [y, m, d] = parts; }
  else if (format.startsWith("DD")) { [d, m, y] = parts; }
  else { [m, d, y] = parts; }
  const date = new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  return !isNaN(date.getTime());
}

function isTimeColumn(colName) {
  const lower = colName.toLowerCase();
  return lower.includes("time") || lower.includes("hour") || lower.includes("clock");
}

function validatePhone(phone, countryCode, phoneMap, allowUnknown) {
  const raw = String(phone || "");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return `Phone number is empty`;

  const code = String(countryCode || "").trim().toUpperCase();
  if (!phoneMap[code]) {
    if (allowUnknown) return null;
    return `Unknown country code "${countryCode}" — cannot validate phone`;
  }
  const expected = phoneMap[code];
  if (digits.length !== expected)
    return `${code} phone must be ${expected} digits, got ${digits.length}`;

  return null;
}

function validateEmail(email) {
  if (!email || String(email).trim() === "") return "Email is empty";
  const str = String(email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str))
    return `Invalid email format: "${str}"`;
  return null;
}

function validateAmount(amount, flagNegative) {
  if (amount === undefined || amount === null || String(amount).trim() === "")
    return "Amount is empty";
  const str = String(amount).trim();
  if (!/^-?\d+(\.\d+)?$/.test(str)) return `Amount "${str}" is not a valid number`;
  const num = parseFloat(str);
  if (flagNegative && num <= 0) return `Amount must be > 0, got ${num}`;
  if (num > 10_000_000) return `Amount ${num} exceeds maximum allowed`;
  return null;
}

function validatePaymentMode(rawMode) {
  if (!rawMode || String(rawMode).trim() === "") return "Payment mode is empty";
  if (String(rawMode) !== String(rawMode).trim())
    return `Payment mode "${rawMode}" has leading/trailing spaces — clean the field`;
  const valid = ["cash", "card", "upi", "netbanking", "wallet", "cod"];
  const val = String(rawMode).trim().toLowerCase();
  if (!valid.includes(val))
    return `Invalid payment mode "${val}" — must be one of: ${valid.join(", ")}`;
  return null;
}

function validateOrderId(orderId, seen, flagDuplicates) {
  if (!orderId || String(orderId).trim() === "") return "order_id is empty";
  const id = String(orderId).trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id))
    return `order_id "${id}" contains invalid characters`;
  if (flagDuplicates) {
    if (seen.has(id)) return `Duplicate order_id: "${id}"`;
    seen.add(id);
  } else {
    seen.add(id);
  }
  return null;
}

// ── Main export ───────────────────────────────────────────

export function validateRows(rows, config) {
  const {
    phoneColumns = ["phone"],
    dateColumns = ["order_date"],
    countryRules = [],
    dateFormats = ["YYYY-MM-DD"],
    requiredFields = [],
    flagDuplicates = true,
    flagNegativeAmounts = true,
    validateEmail: doEmail = true,
    trimWhitespace = true,
    allowUnknownCountry = false,
    strictMode = false,
  } = config;

  const phoneMap = buildPhoneMap(countryRules);
  const seenOrderIds = new Set();
  const hasCountry = rows.length > 0 && "country_code" in rows[0];
  const results = [];

  rows.forEach((rawRow, index) => {
    const rowNum = index + 2;
    const errors = [];

    // Trim if enabled
    const row = trimWhitespace
      ? Object.fromEntries(
        Object.entries(rawRow).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      )
      : rawRow;

    // 1. Required fields
    requiredFields.forEach(field => {
      const val = row[field];
      if (val === undefined || val === null || String(val).trim() === "")
        errors.push(`Missing required field: "${field}"`);
    });

    // 2. Order ID
    if ("order_id" in row) {
      const err = validateOrderId(row.order_id, seenOrderIds, flagDuplicates);
      if (err) errors.push(err);
    }

    // 3. Country code validity
    if (hasCountry && row.country_code) {
      const code = String(row.country_code).trim().toUpperCase();
      if (!phoneMap[code] && !allowUnknownCountry)
        errors.push(`Unknown country_code "${row.country_code}"`);
    }

    // 4. Phone columns
    phoneColumns.forEach(col => {
      if (!(col in row)) return;
      const countryCode = hasCountry
        ? String(row.country_code || "").trim().toUpperCase()
        : (config.countryCode || "IN");
      const err = validatePhone(row[col], countryCode, phoneMap, allowUnknownCountry);
      if (err) errors.push(err);
    });

    // 5. Email
    if (doEmail && "email" in row) {
      const err = validateEmail(row.email);
      if (err) errors.push(err);
    }

    // 6. Date and time columns
    dateColumns.forEach(col => {
      if (!(col in row)) return;
      const val = String(row[col] || "").trim();

      if (!val) {
        errors.push(`"${col}" is empty`);
        return;
      }

      if (isTimeColumn(col)) {
        // Time validation: accept HH:mm:ss or HH:mm
        if (!TIME_REGEX.test(val))
          errors.push(`Time "${val}" in "${col}" must be HH:mm:ss or HH:mm`);
      } else {
        // Date validation
        const { matched, format } = matchesAnyDateFormat(val, dateFormats);
        if (!matched) {
          errors.push(`Date "${val}" in "${col}" doesn't match any accepted format: ${dateFormats.join(", ")}`);
        } else if (!isRealDate(val, format)) {
          errors.push(`Date "${val}" in "${col}" is not a real calendar date`);
        }
      }
    });

    // 7. Amount
    if ("amount" in row) {
      const err = validateAmount(row.amount, flagNegativeAmounts);
      if (err) errors.push(err);
    }

    // 8. Payment mode — use rawRow to catch spaces before trimming
    if ("payment_mode" in rawRow) {
      const err = validatePaymentMode(rawRow.payment_mode);
      if (err) errors.push(err);
    }

    // 9. Customer name
    if ("customer_name" in row) {
      const n = String(row.customer_name || "").trim();
      if (n.length < 2) errors.push(`customer_name "${n}" is too short (min 2 characters)`);
      else if (/^\d+$/.test(n)) errors.push(`customer_name "${n}" is all numbers`);
    }

    results.push({
      rowNumber: rowNum,
      data: row,
      valid: errors.length === 0,
      errors,
      warnings: [],
      countryUsed: hasCountry
        ? String(row.country_code || "").trim().toUpperCase()
        : (config.countryCode || ""),
    });
  });

  return results;
}

// ── Stats for AI summary ──────────────────────────────────

export function buildValidationStats(results) {
  const total = results.length;
  const passed = results.filter(r => r.valid).length;
  const failed = results.filter(r => !r.valid).length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";

  const errorCounts = {};
  results.forEach(r => r.errors.forEach(e => {
    const key = e.split(":")[0].replace(/"/g, "").trim();
    errorCounts[key] = (errorCounts[key] || 0) + 1;
  }));

  const countryCounts = {};
  const countryFails = {};
  results.forEach(r => {
    const c = r.countryUsed || "UNKNOWN";
    countryCounts[c] = (countryCounts[c] || 0) + 1;
    if (!r.valid) countryFails[c] = (countryFails[c] || 0) + 1;
  });

  const topErrors = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return { total, passed, failed, passRate, topErrors, countryCounts, countryFails, errorCounts };
}