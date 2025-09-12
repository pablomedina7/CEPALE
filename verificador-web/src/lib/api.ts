import { Transaction, VerifyResponse, RegisterComprobanteIn, RegisterComprobanteOut } from "./types"

// Switch de mocks
const USE_MOCKS = String(process.env.NEXT_PUBLIC_USE_MOCKS).toLowerCase() === "true"
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL

// ------------ Implementación MOCK ------------
import {
  dbListTransactions,
  dbVerifyTransaction,
  dbRegisterComprobante,
} from "@/mocks/db"

// ------------ Implementación REAL (fetch) ------------
async function realListTransactions(): Promise<Transaction[]> {
  if (!BASE) throw new Error("Falta NEXT_PUBLIC_API_BASE_URL en .env.local")
  const res = await fetch(`${BASE}/transactions`, { // <-- CAMBIAR AQUÍ 
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Error listando: ${res.status}`)
  return res.json()
}

async function realVerifyTransaction(hash: string): Promise<VerifyResponse> {
  if (!BASE) throw new Error("Falta NEXT_PUBLIC_API_BASE_URL en .env.local")
  const res = await fetch(`${BASE}/verify?hash=${encodeURIComponent(hash)}`, { // <-- CAMBIAR AQUÍ
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`Error verificando: ${res.status}`)
  return res.json()
}

async function realRegisterComprobante(
  payload: RegisterComprobanteIn
): Promise<RegisterComprobanteOut> {
  if (!BASE) throw new Error("Falta NEXT_PUBLIC_API_BASE_URL en .env.local")
  const res = await fetch(`${BASE}/comprobantes/register`, { // <-- CAMBIAR AQUÍ
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`No se pudo registrar: ${res.status}`)
  return res.json()
}

// ------------ Exports que usa tu UI ------------
export async function listTransactions(): Promise<Transaction[]> {
  return USE_MOCKS ? dbListTransactions() : realListTransactions()
}

export async function verifyTransaction(hash: string): Promise<VerifyResponse> {
  return USE_MOCKS ? dbVerifyTransaction(hash) : realVerifyTransaction(hash)
}

export async function registerComprobante(
  payload: RegisterComprobanteIn
): Promise<RegisterComprobanteOut> {
  return USE_MOCKS ? dbRegisterComprobante(payload) : realRegisterComprobante(payload)
}
