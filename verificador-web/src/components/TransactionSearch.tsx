"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { verifyTransaction, registerComprobante, listTransactions } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search, RefreshCw, Shield } from "lucide-react"

type Tx = {
  id: string
  hash: string
  sender: string
  amount: number
  date: string
  verified: boolean
}

export function TransactionSearch() {
  const qc = useQueryClient()

  const [searchHash, setSearchHash] = useState("")
  const [verifyingHash, setVerifyingHash] = useState<string | null>(null)
  const [registeringHash, setRegisteringHash] = useState<string | null>(null)

  const { data: transactions = [], isFetching, isError, refetch } = useQuery<Tx[]>({
    queryKey: ["transactions"],
    queryFn: listTransactions,
  })

  const verifyMut = useMutation({
    mutationFn: async (hash: string) => {
      setVerifyingHash(hash)
      return verifyTransaction(hash)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
    onSettled: () => setVerifyingHash(null),
  })

  const registerMut = useMutation({
    mutationFn: async (hash: string) => {
      setRegisteringHash(hash)
      // si tu back solo recibe {hash}, estamos OK
      return registerComprobante({ hash })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
    onSettled: () => setRegisteringHash(null),
  })

  const filtered = useMemo(() => {
    const term = searchHash.trim().toLowerCase()
    if (!term) return transactions
    return transactions.filter((tx) => tx.hash.toLowerCase().includes(term))
  }, [transactions, searchHash])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-ES", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)

  return (
    <div className="page-container nice-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buscar comprobante</h1>
        <p className="text-muted-foreground">Filtrá por hash y gestioná verificaciones</p>
      </div>

      <Card className="mb-8 glass-card card-hover shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Buscar</CardTitle>
          <CardDescription>Ingresa el hash del comprobante</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="0x... / hash..."
              className="flex-1 input-elevated ring-focus"
            />
            <Button variant="outline" className="ring-focus">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Resultados</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => qc.invalidateQueries({ queryKey: ["transactions"] })}
          disabled={isFetching}
          className="ring-focus"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {isError ? (
        <Card className="glass-card border-destructive/40 shadow-card">
          <CardContent className="p-6">
            <p className="text-destructive">Ocurrió un error al cargar.</p>
            <div className="mt-3">
              <Button onClick={() => refetch()} className="btn-primary ring-focus">Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 && !isFetching ? (
        <Card className="glass-card shadow-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground">No hay resultados con ese hash.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(isFetching && transactions.length === 0 ? Array.from({ length: 3 }).map((_, i) => ({ id: `sk${i}` })) : filtered)
            .map((t: any) => {
              const tx: Tx | null = t.hash ? t : null
              const isVerifying = tx?.hash === verifyingHash
              const isRegistering = tx?.hash === registeringHash

              return (
                <Card key={t.id} className="glass-card card-hover shadow-card">
                  <CardContent className="p-6">
                    {!tx ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="h-6 w-40 rounded skeleton" />
                        <div className="h-6 w-48 rounded skeleton" />
                        <div className="h-6 w-56 rounded skeleton" />
                        <div className="h-10 w-52 rounded skeleton" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            {tx.verified ? <CheckCircle className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
                            <Badge variant={tx.verified ? "default" : "destructive"} className={`text-xs ${tx.verified ? "badge-soft" : ""}`}>
                              {tx.verified ? "Verificada" : "No verificada"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Hash:</p>
                          <p className="font-mono text-sm bg-muted/60 px-2 py-1 rounded break-all">{tx.hash}</p>
                        </div>

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
                            <p className="text-xl font-bold text-primary">{formatAmount(tx.amount)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isVerifying}
                            onClick={() => verifyMut.mutate(tx.hash)}
                            className="w-full md:w-auto ring-focus"
                          >
                            {isVerifying ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                            Verificar
                          </Button>
                          <Button
                            size="sm"
                            disabled={isRegistering}
                            onClick={() => registerMut.mutate(tx.hash)}
                            className="w-full md:w-auto btn-primary ring-focus"
                          >
                            {isRegistering ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
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
    </div>
  )
}
