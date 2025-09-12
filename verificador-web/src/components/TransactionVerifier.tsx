"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { verifyTransaction, registerComprobante, listTransactions } from "@/lib/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Shield,
} from "lucide-react"

type Tx = {
  id: string
  hash: string
  sender: string
  amount: number
  date: string
  verified: boolean
}

export function TransactionVerifier() {
  const qc = useQueryClient()

  const [searchHash, setSearchHash] = useState("")
  const [verifyingHash, setVerifyingHash] = useState<string | null>(null)
  const [registeringHash, setRegisteringHash] = useState<string | null>(null)

  // --- DATA ---
  const {
    data: transactions = [],
    isFetching,
    isError,
    refetch,
  } = useQuery<Tx[]>({
    queryKey: ["transactions"],
    queryFn: listTransactions,
  })

  // --- MUTATIONS ---
  const verifyMut = useMutation({
    mutationFn: async (hash: string) => {
      setVerifyingHash(hash)
      return verifyTransaction(hash)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] })
    },
    onSettled: () => {
      setVerifyingHash(null)
    },
  })

  const registerMut = useMutation({
    mutationFn: async (hash: string) => {
      setRegisteringHash(hash)
      return registerComprobante({ hash })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] })
    },
    onSettled: () => {
      setRegisteringHash(null)
    },
  })

  // --- SEARCH (client-side) ---
  const filtered = useMemo(() => {
    const term = searchHash.trim().toLowerCase()
    if (!term) return transactions
    return transactions.filter((tx: Tx) =>
      tx.hash.toLowerCase().includes(term)
    )
  }, [transactions, searchHash])

  const handleSearch = () => {
    // Si preferís pedir al back: crear endpoint /transactions?hash=...
    // Por ahora usamos filtrado client-side con useMemo arriba.
  }

  // --- FORMATTERS ---
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)

  // --- UI ---
  return (
    <div className="page-container nice-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Verificador de Transacciones
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Verifica la autenticidad y estado de tus transacciones mediante hash único
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8 glass-card card-hover shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Transacción
          </CardTitle>
          <CardDescription>
            Ingresa el hash de la transacción para verificar su estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ingresa el hash de la transacción..."
              value={searchHash}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchHash(e.target.value)}
              className="flex-1 input-elevated ring-focus"
            />
            <Button onClick={handleSearch} className="px-6 ring-focus" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Lista de Transacciones
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ["transactions"] })}
            disabled={isFetching}
            title="Actualizar"
            className="ring-focus"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* States: error / empty / list */}
      {isError ? (
        <Card className="glass-card border-destructive/40 shadow-card">
          <CardContent className="p-6">
            <p className="text-destructive">
              Ocurrió un error al cargar las transacciones.
            </p>
            <div className="mt-3">
              <Button onClick={() => refetch()} className="btn-primary ring-focus">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 && !isFetching ? (
        <Card className="glass-card shadow-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              No se encontraron transacciones con ese hash.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(isFetching && transactions.length === 0
            ? Array.from({ length: 3 }).map((_, i) => ({ id: `sk${i}` }))
            : filtered
          ).map((t: any) => {
            const tx: Tx | null = t.hash ? t : null // si es skeleton, no tiene hash
            const isVerifying = tx?.hash === verifyingHash
            const isRegistering = tx?.hash === registeringHash

            return (
              <Card
                key={t.id}
                className="glass-card card-hover shadow-card"
              >
                <CardContent className="p-6">
                  {!tx ? (
                    // Skeleton shimmer
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="h-6 w-40 rounded skeleton" />
                      <div className="h-6 w-48 rounded skeleton" />
                      <div className="h-6 w-56 rounded skeleton" />
                      <div className="h-10 w-52 rounded skeleton" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Estado + Hash */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {tx.verified ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <Badge
                              variant={tx.verified ? "default" : "destructive"}
                              className={`text-xs ${tx.verified ? "badge-soft" : ""}`}
                            >
                              {tx.verified ? "Verificada" : "No Verificada"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Hash:</p>
                          <p className="font-mono text-sm bg-muted/60 px-2 py-1 rounded break-all">
                            {tx.hash}
                          </p>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Remitente:</p>
                          <p className="font-medium text-sm">{tx.sender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha:</p>
                          <p className="text-sm">{formatDate(tx.date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monto:</p>
                          <p className="text-xl font-bold text-primary">
                            {formatAmount(tx.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isVerifying}
                          onClick={() => verifyMut.mutate(tx.hash)}
                          className="w-full md:w-auto ring-focus"
                        >
                          {isVerifying ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Shield className="h-4 w-4 mr-2" />
                          )}
                          Verificar
                        </Button>

                        <Button
                          size="sm"
                          disabled={isRegistering}
                          onClick={() => registerMut.mutate(tx.hash)}
                          className="w-full md:w-auto btn-primary ring-focus"
                        >
                          {isRegistering ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Shield className="h-4 w-4 mr-2" />
                          )}
                          Registrar en Blockchain
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Footer Info */}
      <Card className="mt-8 glass-card shadow-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Seguridad y Confianza</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Todas las transacciones son verificadas mediante hash criptográfico único.
                El backend realiza la validación y el registro on-chain para mantener
                tus claves privadas fuera del navegador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
