import { env } from "../config/env";
import { ethers } from "ethers";

const ABI = [
  "function exists(bytes32 h) view returns (bool)",
  "function anchoredAt(bytes32 h) view returns (uint256)",
  "function anchor(bytes32 h, string meta)"
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

export async function anchorOnChain(hash: string, meta: string) {
  if (!env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY no configurada en .env para firmar transacciones");
  }
  
  const provider = new ethers.JsonRpcProvider(env.RPC_URL);
  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(env.CONTRACT_ADDRESS, ABI, wallet);
  
  try {
    // First check if contract exists and has the function
    const code = await provider.getCode(env.CONTRACT_ADDRESS);
    if (code === "0x") {
      throw new Error(`No contract deployed at address ${env.CONTRACT_ADDRESS}`);
    }
    
    // Try with explicit gas settings
    const tx = await contract.anchor(hash, meta, {
      gasLimit: 100000, // Set explicit gas limit
      gasPrice: ethers.parseUnits("20", "gwei") // Set explicit gas price
    });
    
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    // Enhanced error reporting
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Blockchain anchor failed: ${errorMessage}. Contract: ${env.CONTRACT_ADDRESS}, Hash: ${hash}, Meta: ${meta}`);
  }
}
