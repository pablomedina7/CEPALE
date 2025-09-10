"use client";
import { useState } from "react";
import { hashFromFile } from "@/lib/api";
import { getSigner } from "@/lib/ethersClient";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";
import { ethers } from "ethers";

type AnchorResult = { hash: `0x${string}`; txHash: string; block: number };

export default function HashFileForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnchorResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onGo() {
    if (!file) return;
    setLoading(true);
    try {
      const { hash, meta } = await hashFromFile(file);
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.anchor(hash, meta);
      const rc = await tx.wait();
      setResult({ hash, txHash: tx.hash, block: rc.blockNumber });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button disabled={loading} onClick={onGo} className="px-4 py-2 bg-green-600 text-white rounded">
        {loading ? "Procesando..." : "Hash + Anclar"}
      </button>

      {result && (
        <div className="p-3 border rounded">
          <div><b>Hash:</b> {result.hash}</div>
          <div><b>Tx:</b> <a target="_blank" className="underline" href={`https://sepolia.etherscan.io/tx/${result.txHash}`}>{result.txHash}</a></div>
          <div><b>Block:</b> {result.block}</div>
        </div>
      )}
    </div>
  );
}
