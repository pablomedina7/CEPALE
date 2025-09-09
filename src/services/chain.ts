import { env } from "../config/env";
import { ethers } from "ethers";

const ABI = [
  "function exists(bytes32 h) view returns (bool)",
  "function anchoredAt(bytes32 h) view returns (uint256)"
];

let provider: ethers.JsonRpcProvider | null = null;
let contract: ethers.Contract | null = null;

function ensureContract() {
  if (!env.RPC_URL || !env.CONTRACT_ADDRESS) {
    throw new Error("RPC_URL o CONTRACT_ADDRESS no configurados en .env");
  }
  if (!provider) provider = new ethers.JsonRpcProvider(env.RPC_URL);
  if (!contract) contract = new ethers.Contract(env.CONTRACT_ADDRESS, ABI, provider);
  return contract;
}

export async function checkOnChain(hash: string) {
  const c = ensureContract();
  const exists: boolean = await c.exists(hash);
  if (!exists) return { exists: false };
  const ts: bigint = await c.anchoredAt(hash);
  const timestamp = Number(ts);
  return { exists: true, anchoredAt: timestamp, anchoredAtISO: new Date(timestamp * 1000).toISOString() };
}
