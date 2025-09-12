import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Search } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Home() {
  return (
    <div className="page-container nice-scrollbar">
      {/* Header con título + toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Comprobantes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Elegí qué querés hacer
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Dos opciones */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card card-hover shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">Buscar comprobante</CardTitle>
            <CardDescription>
              Consultá por hash y listá resultados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/buscar">
              <Button variant="outline" className="ring-focus w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Ir a Buscar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">Registrar comprobante</CardTitle>
            <CardDescription>
              Cargá un nuevo comprobante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/registrar">
              <Button className="btn-primary ring-focus w-full md:w-auto">
                <Shield className="h-4 w-4 mr-2" />
                Ir a Registrar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
