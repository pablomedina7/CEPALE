"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { hashFromJson } from "@/lib/api";
import { getSigner } from "@/lib/ethersClient";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";
import { ethers } from "ethers";
import { useState } from "react";

const schema = z.object({
  amount: z.union([z.number(), z.string()]),
  currency: z.string(),
  date: z.string(), // YYYY-MM-DD
  from: z.string(),
  to: z.string(),
  reference: z.string()
});
type FormData = z.infer<typeof schema>;

type AnchorResult = { hash: `0x${string}`; txHash: string; block: number };

export default function HashJsonForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const [result, setResult] = useState<AnchorResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const { hash, meta } = await hashFromJson(data);
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
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
        <input placeholder="amount" {...register("amount")} className="border p-2 rounded" />
        <input placeholder="currency (PYG)" {...register("currency")} className="border p-2 rounded" />
        <input placeholder="date (YYYY-MM-DD)" {...register("date")} className="border p-2 rounded" />
        <input placeholder="from" {...register("from")} className="border p-2 rounded" />
        <input placeholder="to" {...register("to")} className="border p-2 rounded" />
        <input placeholder="reference" {...register("reference")} className="border p-2 rounded" />
        <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Procesando..." : "Generar hash y anclar"}
        </button>
      </form>

      {result && (
        <div className="p-3 border rounded">
          <div><b>Hash:</b> {result.hash}</div>
          <div><b>Tx:</b> <a target="_blank" className="underline" href={`https://sepolia.etherscan.io/tx/${result.txHash}`}>{result.txHash}</a></div>
          <div><b>Block:</b> {result.block}</div>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <pre className="text-red-600">{JSON.stringify(errors, null, 2)}</pre>
      )}
    </div>
  );
}
