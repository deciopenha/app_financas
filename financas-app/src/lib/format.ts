import type { Transaction } from "./types"

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export const formatBRL = (value: number) => brl.format(value)

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

/** Intervalo [início, fim) em YYYY-MM-DD. month: 1-12 ou 0 para o ano todo. */
export function periodRange(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, "0")
  if (month === 0) return { from: `${year}-01-01`, to: `${year + 1}-01-01` }
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
  return { from: `${year}-${pad(month)}-01`, to: `${next.y}-${pad(next.m)}-01` }
}

export function summarize(list: Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of list) {
    if (t.type === "receita") income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export function transactionsToCSV(list: Transaction[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const header = ["Data", "Descrição", "Tipo", "Categoria", "Valor"]
  const rows = list.map((t) => [
    formatDate(t.date),
    esc(t.description),
    t.type === "receita" ? "Receita" : "Despesa",
    t.category,
    (t.type === "receita" ? t.amount : -t.amount).toFixed(2).replace(".", ","),
  ])
  // BOM + ponto e vírgula para abrir corretamente no Excel pt-BR
  return "﻿" + [header, ...rows].map((r) => r.join(";")).join("\r\n")
}

export function downloadCSV(list: Transaction[], filename: string) {
  const blob = new Blob([transactionsToCSV(list)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
