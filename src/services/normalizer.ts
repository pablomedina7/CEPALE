export type Comprobante = {
  amount: number | string;
  currency: string;
  date: string;      // YYYY-MM-DD
  from: string;
  to: string;
  reference: string;
  [k: string]: unknown;
};

const cleanString = (s: string) =>
  s.normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();

const isoDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) throw new Error("Fecha inválida: usar YYYY-MM-DD");
  return `${m[1]}-${m[2]}-${m[3]}`;
};

function stableStringify(obj: Record<string, any>): string {
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(k => `"${k}":${valueToStable(obj[k])}`);
  return `{${pairs.join(",")}}`;
}

function valueToStable(v: any): string {
  if (v === null) return "null";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(valueToStable).join(",")}]`;
  if (typeof v === "object") return stableStringify(v);
  return "null";
}

export function normalizePayload(input: Partial<Comprobante>) {
  const normalized = {
    amount: typeof input.amount === "string" ? Number(input.amount) : (input.amount ?? 0),
    currency: cleanString(String(input.currency ?? "")),
    date: isoDate(String(input.date ?? "")),
    from: cleanString(String(input.from ?? "")),
    to: cleanString(String(input.to ?? "")),
    reference: cleanString(String(input.reference ?? "")),
  };
  const stable = stableStringify(normalized);
  return { normalized, stable };
}
