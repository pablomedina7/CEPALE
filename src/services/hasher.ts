import { createHash } from "crypto";

export function toBytes32Sha256(input: string | Buffer) {
  const hex = createHash("sha256").update(input).digest("hex");
  return { bytes32: "0x" + hex, hex };
}
