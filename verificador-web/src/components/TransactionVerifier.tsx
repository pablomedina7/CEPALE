"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { CheckCircle, XCircle, Search, RefreshCw, Shield } from "lucide-react"

interface Transaction {
  id: string
  hash: string
  sender: string
  amount: number
  date: string
  verified: boolean
}

// Datos de ejemplo - en producción vendrían del backend
const mockTransactions: Transaction[] = [
  {
    id: "1",
    hash: "0xa1b2c3d4e5f6789012345678901234567890abcdef",
    sender: "usuario@ejemplo.com",
    amount: 1250.5,
    date: "2024-01-15T10:30:00Z",
    verified: true,
  },
  {
    id: "2",
    hash: "0xf6e5d4c3b2a1098765432109876543210fedcba09",
    sender: "empresa@negocio.com",
    amount: 750.0,
    date: "2024-01-14T15:45:00Z",
    verified: false,
  },
  {
    id: "3",
    hash: "0x123456789abcdef0123456789abcdef0123456789a",
    sender: "cliente@tienda.com",
    amount: 2100.75,
    date: "2024-01-13T09:15:00Z",
    verified: true,
  },
]

function TransactionVerifierComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchHash, setSearchHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerifyTransaction = async (hash: string) => {
    setIsLoading(true)
    // Simular llamada al backend
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simular verificación - en producción sería una llamada real al backend
    const updatedTransactions = transactions.map((tx) =>
      tx.hash === hash ? { ...tx, verified: Math.random() > 0.3 } : tx,
    )
    setTransactions(updatedTransactions)
    setIsLoading(false)
  }

  const handleSearchTransaction = () => {
    if (!searchHash.trim()) return

    // En producción, esto haría una búsqueda en el backend
    const foundTransaction = transactions.find((tx) => tx.hash.toLowerCase().includes(searchHash.toLowerCase()))

    if (foundTransaction) {
      // Resaltar la transacción encontrada - aquí simplemente la movemos al inicio
      setTransactions((prev) => [foundTransaction, ...prev.filter((p) => p.id !== foundTransaction.id)])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Verificador de Transacciones</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Verifica la autenticidad y estado de tus transacciones mediante hash único
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Transacción
          </CardTitle>
          <CardDescription>Ingresa el hash de la transacción para verificar su estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ingresa el hash de la transacción..."
              value={searchHash}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchHash(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearchTransaction} className="px-6">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Lista de Transacciones</h2>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="grid gap-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Hash y Estado */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {transaction.verified ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <Badge variant={transaction.verified ? "default" : "destructive"} className="text-xs">
                          {transaction.verified ? "Verificada" : "No Verificada"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Hash:</p>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">{transaction.hash}</p>
                    </div>
                  </div>

                  {/* Detalles de la Transacción */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Remitente:</p>
                      <p className="font-medium text-sm">{transaction.sender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha:</p>
                      <p className="text-sm">{formatDate(transaction.date)}</p>
                    </div>
                  </div>

                  {/* Monto y Acciones */}
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Monto:</p>
                      <p className="text-xl font-bold text-primary">{formatAmount(transaction.amount)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyTransaction(transaction.hash)}
                      disabled={isLoading}
                      className="w-full md:w-auto"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Re-verificar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Seguridad y Confianza</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Todas las transacciones son verificadas mediante hash criptográfico único. El sistema valida
                automáticamente la integridad y autenticidad de cada transacciones contra nuestra base de datos segura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionVerifierComponent
export { TransactionVerifierComponent as TransactionVerifier }

