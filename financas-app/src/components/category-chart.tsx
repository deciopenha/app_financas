"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { CATEGORY_COLORS } from "@/lib/categories"
import { formatBRL } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  title: string
  data: { name: string; value: number }[]
  loading: boolean
  emptyText: string
}

export function CategoryChart({ title, data, loading, emptyText }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{loading ? "Carregando..." : emptyText}</p>
        ) : (
          <>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {data.map((c) => (
                      <Cell key={c.name} fill={CATEGORY_COLORS[c.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatBRL(Number(v))}
                    contentStyle={{
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: "var(--popover-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {data.map((c) => (
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
  )
}
