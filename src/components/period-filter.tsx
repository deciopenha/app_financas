"use client"

import { MONTHS } from "@/lib/format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  year: number
  month: number // 0 = ano todo
  onChange: (year: number, month: number) => void
}

export function PeriodFilter({ year, month, onChange }: Props) {
  const current = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => current - i)
  const monthItems = [{ value: "0", label: "Ano todo" }, ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))]
  const yearItems = years.map((y) => ({ value: String(y), label: String(y) }))

  return (
    <div className="flex gap-2">
      <Select items={monthItems} value={String(month)} onValueChange={(v) => v && onChange(year, Number(v))}>
        <SelectTrigger className="w-36" aria-label="Mês">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthItems.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={yearItems} value={String(year)} onValueChange={(v) => v && onChange(Number(v), month)}>
        <SelectTrigger className="w-24" aria-label="Ano">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearItems.map((y) => (
            <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
