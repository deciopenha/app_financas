"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CATEGORIES } from "@/lib/categories"
import { downloadCSV, formatBRL, formatDate, periodRange } from "@/lib/format"
import type { Transaction } from "@/lib/types"
import { PeriodFilter } from "@/components/period-filter"
import { TransactionDialog } from "@/components/transaction-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function TransactionsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    const { from, to } = periodRange(year, month)
    let query = createClient()
      .from("transactions")
      .select("id,description,amount,date,type,category")
      .gte("date", from)
      .lt("date", to)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
    if (category !== "all") query = query.eq("category", category)

    query.then(({ data, error }) => {
      if (!active) return
      if (error) toast.error("Erro ao carregar transações.")
      setItems((data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Transaction[])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [year, month, category, reload])

  const refresh = useCallback(() => {
    setLoading(true)
    setReload((n) => n + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? items.filter((t) => t.description.toLowerCase().includes(q)) : items
  }, [items, search])

  async function remove(t: Transaction) {
    if (!window.confirm(`Excluir "${t.description}"?`)) return
    const { error } = await createClient().from("transactions").delete().eq("id", t.id)
    if (error) return toast.error("Não foi possível excluir.")
    toast.success("Transação excluída.")
    refresh()
  }

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setDialogOpen(true)
  }

  function exportCSV() {
    if (filtered.length === 0) return toast.error("Nenhuma transação para exportar.")
    const period = `${year}${month ? "-" + String(month).padStart(2, "0") : ""}`
    downloadCSV(filtered, `transacoes-${period}.csv`)
  }

  const categoryItems = [{ value: "all", label: "Todas as categorias" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download /> Exportar CSV
          </Button>
          <Button onClick={openNew}>
            <Plus /> Nova
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8"
            placeholder="Buscar por descrição"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <PeriodFilter
          year={year}
          month={month}
          onChange={(y, m) => {
            setLoading(true)
            setYear(y)
            setMonth(m)
          }}
        />
        <Select
          items={categoryItems}
          value={category}
          onValueChange={(v) => {
            if (!v) return
            setLoading(true)
            setCategory(v)
          }}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {loading ? "Carregando..." : "Nenhuma transação encontrada."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4 whitespace-nowrap text-muted-foreground">{formatDate(t.date)}</TableCell>
                    <TableCell className="max-w-48 truncate font-medium">{t.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{t.category}</Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium whitespace-nowrap tabular-nums",
                        t.type === "receita" ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {t.type === "receita" ? "+" : "−"}
                      {formatBRL(t.amount)}
                    </TableCell>
                    <TableCell className="pr-4 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)} aria-label="Editar">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => remove(t)} aria-label="Excluir">
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} transaction={editing} onSaved={refresh} />
    </div>
  )
}
