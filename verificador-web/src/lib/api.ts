export type HashJsonResponse = {
  hash: `0x${string}`;
  meta: string;
  stable: string;
};
export type HashFileResponse = {
  hash: `0x${string}`;
  meta: string;
  filename: string;
};
export type VerifyResponse =
  | { exists: false }
  | { exists: true; anchoredAt: number; anchoredAtISO: string };

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function hashFromJson(payload: unknown): Promise<HashJsonResponse> {
  const res = await fetch(`${BASE}/hash/json`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Error /hash/json");
  return res.json();
}

export async function hashFromFile(file: File): Promise<HashFileResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/hash/file`, { method:"POST", body: fd });
  if (!res.ok) throw new Error("Error /hash/file");
  return res.json();
}

export async function verifyHash(hash: `0x${string}`): Promise<VerifyResponse> {
  const res = await fetch(`${BASE}/verify/${hash}`);
  if (!res.ok) throw new Error("Error /verify");
  return res.json();
}
