import { Transaction, VerifyResponse, RegisterComprobanteIn, RegisterComprobanteOut } from "../lib/types"

/** ================== "BD" en memoria ================== */
let TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    hash: "a1b2c3d4e5f6789012345678901234567890abcdef",
    sender: "usuario@ejemplo.com",
    amount: 1250.5,
    date: "2024-01-15T10:30:00Z",
    verified: true,
  },
  {
    id: "2",
    hash: "f6e5d4c3b2a1098765432109876543210fedcba09",
    sender: "empresa@negocio.com",
    amount: 750.0,
    date: "2024-01-14T15:45:00Z",
    verified: false,
  },
  {
    id: "3",
    hash: "123456789abcdef0123456789abcdef0123456789a",
    sender: "cliente@tienda.com",
    amount: 2100.75,
    date: "2024-01-13T09:15:00Z",
    verified: true,
  },
]

/** ================== Utils ================== */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function randomTxHash(): string {
  const chars = "abcdef0123456789"
  let s = "0x"
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/** ================== "Endpoints" mock ================== */
export async function dbListTransactions(): Promise<Transaction[]> {
  await wait(300) // simula latencia
  // devolvemos copia para evitar mutaciones externas
  return JSON.parse(JSON.stringify(TRANSACTIONS)) as Transaction[]
}

export async function dbVerifyTransaction(hash: string): Promise<VerifyResponse> {
  await wait(400)
  // Regla determinista simple para aprobar: último char hex par -> approved = true
  const last = hash.at(-1)?.toLowerCase() ?? "0"
  const n = parseInt(last, 16)
  const approved = !Number.isNaN(n) ? n % 2 === 0 : true

  // Actualizamos verified si existe
  TRANSACTIONS = TRANSACTIONS.map((t: Transaction) =>
    t.hash === hash ? { ...t, verified: approved } : t
  )

  return { hash, approved }
}

export async function dbRegisterComprobante(
  payload: RegisterComprobanteIn
): Promise<RegisterComprobanteOut> {
  await wait(700)
  const txHash = randomTxHash()

  const exists = TRANSACTIONS.some((t: Transaction) => t.hash === payload.hash)

  if (!exists) {
    TRANSACTIONS.push({
      id: (TRANSACTIONS.length + 1).toString(),
      hash: payload.hash,
      sender: payload.sender ?? "sin-remitente@ejemplo.com",
      amount: payload.amount ?? 0,
      date: payload.date ?? new Date().toISOString(),
      verified: true, // al registrar, dejamos verificado en mock
    })
  } else {
    TRANSACTIONS = TRANSACTIONS.map((t: Transaction) =>
      t.hash === payload.hash
        ? {
            ...t,
            sender: payload.sender ?? t.sender,
            amount: payload.amount ?? t.amount,
            date: payload.date ?? t.date,
            verified: true,
          }
        : t
    )
  }

  return { status: "submitted", txHash }
}
