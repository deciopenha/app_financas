"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { CATEGORY_COLORS } from "@/lib/categories"
import { formatBRL, formatDate, periodRange, summarize } from "@/lib/format"
import type { Transaction } from "@/lib/types"
import { PeriodFilter } from "@/components/period-filter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const { from, to } = periodRange(year, month)
    createClient()
      .from("transactions")
      .select("id,description,amount,date,type,category")
      .gte("date", from)
      .lt("date", to)
      .order("date", { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setItems((data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Transaction[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [year, month])

  const { income, expense, balance } = useMemo(() => summarize(items), [items])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of items) {
      if (t.type === "despesa") map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [items])

  const cards = [
    { label: "Receita total", value: income, icon: ArrowUpCircle, color: "text-emerald-600" },
    { label: "Despesa total", value: expense, icon: ArrowDownCircle, color: "text-rose-600" },
    { label: "Saldo", value: balance, icon: Scale, color: balance >= 0 ? "text-primary" : "text-rose-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <PeriodFilter
          year={year}
          month={month}
          onChange={(y, m) => {
            setLoading(true)
            setYear(y)
            setMonth(m)
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardDescription>{label}</CardDescription>
              <Icon className={cn("size-5", color)} />
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-semibold tabular-nums", color)}>{loading ? "—" : formatBRL(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {loading ? "Carregando..." : "Nenhuma despesa no período."}
              </p>
            ) : (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        {byCategory.map((c) => (
                          <Cell key={c.name} fill={CATEGORY_COLORS[c.name] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => formatBRL(Number(v))}
                        contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 8 }}
                        itemStyle={{ color: "var(--popover-foreground)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {byCategory.map((c) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ background: CATEGORY_COLORS[c.name] ?? "#94a3b8" }} />
                      <span className="flex-1">{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">{formatBRL(c.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Últimas transações</CardTitle>
            <Link href="/transacoes" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {loading ? "Carregando..." : "Nenhuma transação no período."}
              </p>
            ) : (
              <ul className="divide-y">
                {items.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLORS[t.category] ?? "#94a3b8" }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} · {formatDate(t.date)}
                      </p>
                    </div>
                    <span className={cn("text-sm font-medium tabular-nums", t.type === "receita" ? "text-emerald-600" : "text-rose-600")}>
                      {t.type === "receita" ? "+" : "−"}
                      {formatBRL(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
