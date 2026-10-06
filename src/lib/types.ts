export type TransactionType = "receita" | "despesa"

export type Transaction = {
  id: string
  description: string
  amount: number
  date: string // YYYY-MM-DD
  type: TransactionType
  category: string
}
