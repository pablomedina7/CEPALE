"use client";
import { useState } from "react";
import { hashFromJson, hashFromFile, verifyHash, type VerifyResponse } from "@/lib/api";
import TransactionVerifier from "@/components/TransactionVerifier";

type VerifyUI = (VerifyResponse & { hash: `0x${string}` }) | null;

export default function VerificarPage() {
  const [jsonText, setJsonText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resu, setResu] = useState<VerifyUI>(null);
  const [loading, setLoading] = useState(false);

  async function verifyFromJson() {
    setLoading(true);
    try {
      const payload = JSON.parse(jsonText);
      const { hash } = await hashFromJson(payload);
      const r = await verifyHash(hash);
      setResu({ hash, ...r });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "JSON inválido o error";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  async function verifyFromFile() {
    if (!file) return;
    setLoading(true);
    try {
      const { hash } = await hashFromFile(file);
      const r = await verifyHash(hash);
      setResu({ hash, ...r });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 space-y-6">
      <h2 className="text-xl font-semibold">Verificar Comprobante</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded space-y-2">
          <h3 className="font-medium">Desde JSON</h3>
          <textarea
            className="w-full border p-2 rounded h-40"
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
          />
          <button disabled={loading} onClick={verifyFromJson} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </div>

        <div className="p-4 border rounded space-y-2">
          <h3 className="font-medium">Desde Archivo</h3>
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button disabled={loading} onClick={verifyFromFile} className="px-4 py-2 bg-emerald-600 text-white rounded">
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </div>
      </div>

      {resu && (
        <div className="p-4 border rounded">
          <div><b>Hash:</b> {resu.hash}</div>
          {resu.exists
            ? <div className="mt-2">✅ Anclado el {resu.anchoredAtISO} (epoch {resu.anchoredAt})</div>
            : <div className="mt-2">❌ No encontrado</div>}
        </div>
      )}

  <hr />

  {/* Componente de prueba: lista y verificador simulado */}
  <TransactionVerifier />
    </main>
  );
}
