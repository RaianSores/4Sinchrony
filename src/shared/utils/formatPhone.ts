export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatPhone(value: string): string {
  const digits = cleanPhone(value);
  if (digits.length < 3) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  // 11 digits total = mobile (9-digit rest, 5+4 split); anything shorter = landline (4+4 split).
  const firstLength = digits.length === 11 ? 5 : 4;
  const first = rest.slice(0, firstLength);
  const second = rest.slice(firstLength);
  return `(${ddd}) ${first}-${second}`;
}
