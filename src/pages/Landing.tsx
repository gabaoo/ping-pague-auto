import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Zap, Clock, DollarSign } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Automação Total",
      description: "Envie cobranças automaticamente via WhatsApp com apenas alguns cliques",
    },
    {
      icon: Clock,
      title: "Economize Tempo",
      description: "Pare de cobrar manualmente e foque no crescimento do seu negócio",
    },
    {
      icon: DollarSign,
      title: "Receba Mais Rápido",
      description: "Reduza a inadimplência com lembretes automáticos e links de pagamento",
    },
    {
      icon: CheckCircle,
      title: "Simples e Direto",
      description: "Interface intuitiva, sem complicação. Comece a usar em minutos",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
          Automatize suas Cobranças via
          <span className="text-primary"> WhatsApp</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          O PingPague é a solução completa para microempreendedores e autônomos que querem
          economizar tempo e receber pagamentos mais rápido.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg">
            Começar Gratuitamente
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            Ver Como Funciona
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Por que usar o PingPague?</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl rounded-lg bg-primary/5 p-12">
          <h2 className="mb-4 text-3xl font-bold">
            Pronto para economizar tempo e aumentar seus recebimentos?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Cadastre-se gratuitamente e envie sua primeira cobrança em menos de 5 minutos.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Criar Minha Conta Grátis
          </Button>
        </div>
      </section>
    </div>
  );
}
