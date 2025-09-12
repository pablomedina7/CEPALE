import { z } from "zod"

export const HashSchema = z.object({
  hash: z.string().min(10, "Hash/comprobante muy corto"),
})

export const RegisterSchema = z.object({
  hash: z.string().min(10),
  // agrega campos si los pide tu back (monto, concepto, etc.)
})
