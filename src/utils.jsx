// utils.js
export function toAr(number) {
  return new Intl.NumberFormat("fr-FR").format(number);
}

export function exportPDF(row) {
  console.log("Export PDF pour :", row);
  // ton code d’export
}

// Hash a password using Web Crypto API (SHA-256), returns hex string
export async function hashPwd(password) {
  if (!password) return '';
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buf));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
