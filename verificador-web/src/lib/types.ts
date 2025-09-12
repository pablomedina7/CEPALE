export interface Transaction {
  id: string
  hash: string
  sender: string
  amount: number
  date: string
  verified: boolean
}

export interface VerifyResponse {
  hash: string
  approved: boolean
}

export interface RegisterComprobanteIn {
  hash: string
  sender?: string
  amount?: number
  date?: string // ISO
}

export interface RegisterComprobanteOut {
  status: 'submitted' | 'confirmed' | 'failed'
  txHash: string
}
