"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CATEGORIES } from "@/lib/categories"
import type { Transaction, TransactionType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null // null = nova
  onSaved: () => void
}

const today = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function TransactionDialog({ open, onOpenChange, transaction, onSaved }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>
        {/* key reinicia o formulário a cada abertura/edição */}
        <TransactionForm
          key={transaction?.id ?? "new"}
          transaction={transaction}
          onCancel={() => onOpenChange(false)}
          onSaved={() => {
            onOpenChange(false)
            onSaved()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function TransactionForm({
  transaction,
  onCancel,
  onSaved,
}: {
  transaction: Transaction | null
  onCancel: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "despesa")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "")
  const [date, setDate] = useState(transaction?.date ?? today())
  const [category, setCategory] = useState(transaction?.category ?? "Alimentação")
  const [saving, setSaving] = useState(false)

  const categoryItems = CATEGORIES.map((c) => ({ value: c, label: c }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount.replace(",", "."))
    if (!(value > 0)) return toast.error("Informe um valor maior que zero.")

    setSaving(true)
    const supabase = createClient()
    const payload = { description: description.trim(), amount: value, date, type, category }
    const { error } = transaction
      ? await supabase.from("transactions").update(payload).eq("id", transaction.id)
      : await supabase.from("transactions").insert(payload)
    setSaving(false)

    if (error) return toast.error("Não foi possível salvar a transação.")
    toast.success(transaction ? "Transação atualizada." : "Transação criada.")
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
        {(["despesa", "receita"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium transition-colors",
              type === t
                ? t === "receita"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "receita" ? "Receita" : "Despesa"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" required maxLength={120} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input id="amount" required inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select items={categoryItems} value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-full">
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

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
