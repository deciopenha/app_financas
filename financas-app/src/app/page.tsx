import Link from "next/link"
import { BarChart3, Download, ListChecks, ShieldCheck, Smartphone, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  { icon: BarChart3, title: "Dashboard visual", text: "Receitas, despesas e saldo do mês com gráfico por categoria." },
  { icon: ListChecks, title: "Controle total", text: "Cadastre, edite e exclua transações com busca e filtros." },
  { icon: Download, title: "Exporte em CSV", text: "Leve suas transações filtradas para a planilha que preferir." },
  { icon: ShieldCheck, title: "Dados protegidos", text: "Cada usuário enxerga somente as próprias transações." },
  { icon: Smartphone, title: "Funciona no celular", text: "Layout responsivo para usar em qualquer tela." },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </span>
          Finanças Pessoais
        </span>
        <Button nativeButton={false} render={<Link href="/login" />} variant="ghost">
          Entrar
        </Button>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Suas finanças em um só lugar, <span className="text-primary">simples e visual</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Registre receitas e despesas, acompanhe o saldo do mês e descubra para onde vai o seu dinheiro.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" className="h-10 px-5" nativeButton={false} render={<Link href="/login" />}>
            Começar grátis
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 size-6 text-primary" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Finanças Pessoais App
      </footer>
    </div>
  )
}
