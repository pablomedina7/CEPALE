import Link from "next/link";
import WalletButton from "@/components/WalletButton";

export default function Home() {
  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Verificador Blockchain</h1>
        <WalletButton/>
      </div>
      <div className="flex gap-4">
        <Link className="px-4 py-2 rounded bg-blue-600 text-white" href="/registrar">Registrar</Link>
        <Link className="px-4 py-2 rounded bg-emerald-600 text-white" href="/verificar">Verificar</Link>
      </div>
    </main>
  );
}
