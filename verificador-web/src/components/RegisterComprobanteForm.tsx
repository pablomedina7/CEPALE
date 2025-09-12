"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerComprobante } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Shield } from "lucide-react"

const Schema = z.object({
  hash: z.string().min(10, "Hash muy corto"),
  sender: z.string().email("Email inválido").optional().or(z.literal("")).transform(v => v || undefined),
  amount: z.coerce.number().positive("Monto inválido"),
  date: z.string().optional(), // ISO opcional; si no, usamos now
})

type FormData = z.infer<typeof Schema>

export function RegisterComprobanteForm() {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { date: new Date().toISOString().slice(0,16) }, // si usás type="datetime-local"
  })

  const mut = useMutation({
    mutationFn: (data: FormData) =>
      registerComprobante({
        hash: data.hash,
        sender: data.sender,
        amount: data.amount,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] })
      reset()
    },
  })

  return (
    <div className="page-container nice-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Registrar comprobante</h1>
        <p className="text-muted-foreground">Carga un comprobante y deja que el backend lo registre on-chain</p>
      </div>

      <Card className="glass-card card-hover shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle>Datos del comprobante</CardTitle>
          <CardDescription>Completá los campos requeridos</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => mut.mutate(d))}
            className="grid gap-4"
          >
            <div>
              <label className="block text-sm mb-1">Hash *</label>
              <Input placeholder="0x... / hash" {...register("hash")} className="input-elevated ring-focus" />
              {errors.hash && <p className="text-sm text-destructive mt-1">{errors.hash.message}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1">Remitente (email)</label>
              <Input placeholder="usuario@correo.com" {...register("sender")} className="input-elevated ring-focus" />
              {errors.sender && <p className="text-sm text-destructive mt-1">{errors.sender.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Monto *</label>
                <Input placeholder="1000.50" type="number" step="0.01" {...register("amount")} className="input-elevated ring-focus" />
                {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Fecha</label>
                <Input type="datetime-local" {...register("date")} className="input-elevated ring-focus" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={mut.isPending} className="btn-primary ring-focus">
                {mut.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                Registrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
