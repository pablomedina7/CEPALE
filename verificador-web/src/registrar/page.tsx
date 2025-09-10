import HashJsonForm from "@/components/HashJsonForm";
import HashFileForm from "@/components/HashFileForm";

export default function RegistrarPage() {
  return (
    <main className="p-8 space-y-6">
      <h2 className="text-xl font-semibold">Registrar / Anclar Comprobante</h2>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Datos (JSON)</h3>
          <HashJsonForm />
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Archivo (PDF/Imagen)</h3>
          <HashFileForm />
        </div>
      </section>
    </main>
  );
}
