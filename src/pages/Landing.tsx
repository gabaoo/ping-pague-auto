import { Button } from "@/components/ui/button";
import conversaWhatsAppImg from "../images/Conversa-de-pagamento-via-WhatsApp.webp";
import imageEsteticista from "../images/Esteticista-em-ambiente-de-cuidados-_1_.webp";
import imageProfessor from "../images/Professor-em-sala-de-aula-_1_.webp";
import imagePersonal from "../images/Treinador-Pessoal-no-Ambiente-Moderno-_1_.webp";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  MessageSquarePlus,
  Zap,
  ArrowDown,
  Clock,
  TrendingDown,
  List,
  BarChart,
  Star,
  Check,
  Mail,
  Phone,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  // Dados para as seções (extraídos do Código 2)
  const dores = [
    {
      icon: Clock,
      bgColor: "bg-error/10",
      textColor: "text-error",
      title: "Perda de Tempo",
      description:
        "Horas gastas todo mês enviando 'Oi, tudo bem? Sobre o pagamento...' um por um.",
    },
    {
      icon: TrendingDown,
      bgColor: "bg-error/10",
      textColor: "text-error",
      title: "Inadimplência Alta",
      description:
        "Clientes esquecem de pagar sem um lembrete. Você fica sem graça de cobrar e o dinheiro não entra.",
    },
    {
      icon: List,
      bgColor: "bg-error/10",
      textColor: "text-error",
      title: "Falta de Controle",
      description:
        "Planilhas, anotações, WhatsApp... Quem pagou? Quem está devendo? Um caos para gerenciar.",
    },
  ];

  const passos = [
    {
      step: "1",
      title: "Cadastre seu Cliente",
      description:
        "Informe o nome, WhatsApp e o valor da cobrança (única ou recorrente).",
      footer: "Tempo estimado: 2 minutos",
      footerBg: "bg-primary-50", // Você precisará definir esta cor no seu tailwind.config
    },
    {
      step: "2",
      title: "O PingPague Envia",
      description:
        "Na data certa, enviamos uma mensagem automática via WhatsApp com o link de pagamento PIX.",
      footer: "Automação moderna na nuvem",
      footerBg: "bg-secondary-50", // Você precisará definir esta cor
    },
    {
      step: "3",
      title: "Receba e Relaxe",
      description:
        "O cliente paga, o status é atualizado no seu painel e o dinheiro cai na sua conta. Simples assim.",
      footer: "Pagamento direto na sua conta",
      footerBg: "bg-secondary-50", // Você precisará definir esta cor
    },
  ];

  const beneficios = [
    {
      icon: BarChart,
      title: "Controle Total",
      description:
        "Painel simples: veja em um só lugar quem pagou, quem está pendente e quem está atrasado.",
    },
    {
      icon: Clock,
      title: "Tempo de Volta",
      description:
        "Reduza horas perdidas enviando mensagens e lembretes manualmente, um por um.",
    },
    {
      icon: TrendingDown,
      title: "Menos Inadimplência",
      description:
        "Lembretes automáticos na data certa aumentam os pagamentos em dia e reduzem o esquecimento.",
    },
  ];

  const depoimentos = [
    {
      img: imagePersonal,
      name: "Paulo Silva",
      role: "Personal Trainer",
      text: "Recuperei 80% dos pagamentos atrasados em 2 semanas usando o PingPague.",
    },
    {
      img: imageEsteticista,
      name: "Camila Andrade",
      role: "Esteticista",
      text: "Antes eu perdia horas cobrando. Agora, o sistema faz tudo sozinho.",
    },
    {
      img: imageProfessor,
      name: "Roberto M.",
      role: "Professor Particular",
      text: "Facilita minha rotina e mantém meus alunos em dia. Recomendo demais!",
    },
  ];

  const planos = [
    {
      title: "Iniciante",
      price: "R$ 0,00",
      description: "Para testar e começar",
      features: ["Até 10 clientes ativos", "Envios automáticos", "Link de pagamento PIX"],
      buttonText: "Escolher plano",
      popular: false,
    },
    {
      title: "Profissional",
      price: "R$ 29,90",
      priceSuffix: "/mês",
      description: "Para autônomos e MEIs",
      features: ["Clientes ilimitados", "Envios automáticos", "Painel de controle (Status)"],
      buttonText: "Escolher plano",
      popular: true,
    },
    {
      title: "Business",
      price: "R$ 79,90",
      priceSuffix: "/mês",
      description: "Para clínicas e academias",
      features: ["Tudo do Profissional", "Relatórios avançados", "Suporte prioritário"],
      buttonText: "Escolher plano",
      popular: false,
    },
  ];

  const faqItems = [
    {
      question: "O dinheiro cai direto na minha conta?",
      answer:
        "Sim. Os pagamentos são feitos via link ou integração com o gateway de sua escolha (como PagSeguro ou Gerencianet), e o valor vai direto para sua conta bancária.",
    },
    {
      question: "As mensagens são enviadas pelo meu WhatsApp?",
      answer:
        "Não! Por motivo de segurança e organização, realizamos cobranças pelo nosso WhatsApp. Todos os pagamentos são feitos pelos canais oficiais informados previamente.",
    },
    {
      question: "Como o sistema sabe quando o cliente pagou?",
      answer:
        "O PingPague atualiza o status automaticamente assim que o pagamento é confirmado pelo seu gateway. Você verá o status de 'Pago' no painel sem precisar verificar manualmente.",
    },
    {
      question: "E se o cliente não pagar na data?",
      answer:
        "Você pode configurar lembretes automáticos para antes e depois do vencimento. Assim, o sistema reenvia as mensagens de forma educada e automática.",
    },
    {
      question: "O PingPague é seguro?",
      answer:
        "Sim. Usamos autenticação com Supabase Auth e integrações seguras com provedores de pagamento. Seus dados e os dos seus clientes ficam protegidos o tempo todo.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Navbar */}
      <nav className="sticky top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <MessageSquarePlus className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">PingPague</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="link" asChild>
                <a href="#comofunciona" className="text-muted-foreground">
                  Como Funciona
                </a>
              </Button>
              <Button variant="link" asChild>
                <a href="#beneficios" className="text-muted-foreground">
                  Benefícios
                </a>
              </Button>

              <Button variant="link" asChild>
                <a href="#faq" className="text-muted-foreground">
                  FAQ
                </a>
              </Button>
              <Button variant="link" asChild>
                <a href="#precos" className="text-muted-foreground">
                  Comece agora
                </a>
              </Button>
              <Button onClick={() => navigate("/auth")}>Entrar</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="pt-8 text-4xl lg:text-6xl font-bold leading-tight">
                  Automatize suas Cobranças via
                  <span className="text-primary"> WhatsApp</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Recupere seu tempo e reduza a inadimplência. <br></br> O WhatsApp cobra
                  por você tudo 100% no piloto automático.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  <a href="#precos" >
                    Comece agora
                  </a>                 </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  asChild
                >
                  <a href="#comofunciona">
                    <ArrowDown className="w-5 h-5 mr-2" />
                    Ver como funciona
                  </a>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="font-bold text-2xl ">10 min</div>
                  <div className="text-sm text-muted-foreground">
                    Onboarding Rápido
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl ">
                    100%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Plug & Play
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl ">PIX</div>
                  <div className="text-sm text-muted-foreground">
                    Integrado
                  </div>
                </div>
              </div>
            </div>
            <img
              src={conversaWhatsAppImg}
              alt="Exemplo de conversa automática de cobrança no WhatsApp"
              className="max-w-sm w-full rounded-lg "
            />

          </div>
        </div>
      </section>

      {/* 3. Dores (Você se identifica?) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              Você se identifica com isso?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cobrar manualmente é um dreno de tempo e energia. Você esquece, o
              cliente atrasa, e seu fluxo de caixa sofre.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dores.map((dor) => {
              const Icon = dor.icon;
              return (
                <div
                  key={dor.title}
                  className="rounded-lg border bg-card p-6 text-center"
                >
                  <div
                    className={`w-16 h-16 ${dor.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className={`w-8 h-8 ${dor.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{dor.title}</h3>
                  <p className="text-muted-foreground">{dor.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Como Funciona */}
      <section id="comofunciona" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              Sua primeira cobrança em 10 minutos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nosso fluxo é 100% plug & play, sem necessidade de
              conhecimento técnico.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {passos.map((passo) => (
              <div key={passo.step} className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-2xl text-primary-foreground">
                    {passo.step}
                  </span>
                </div>
                <h3 className="font-semibold text-xl mb-4">{passo.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {passo.description}
                </p>
                <div
                  className={`rounded-lg p-4 ${passo.footerBg} bg-opacity-20`}
                >
                  <div className="text-sm text-primary font-semibold">
                    {passo.footer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Benefícios */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              Feito para quem não tem tempo a perder
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recupere seu foco no que realmente importa: seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beneficios.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-lg border bg-card p-6 text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Depoimentos */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              O que nossos clientes dizem
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6" fill="currentColor" />
                ))}
              </div>
              <span className="font-semibold text-lg">
                4.9/5 - Baseado em 147 avaliações
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento) => (
              <div
                key={depoimento.name}
                className="rounded-lg border bg-card p-6"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={depoimento.img}
                    alt={depoimento.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold">{depoimento.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {depoimento.role}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{depoimento.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Preços */}
      <section id="precos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              Um preço que cabe no seu bolso
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece de graça e escale conforme seu negócio cresce.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planos.map((plano) => (
              <div
                key={plano.title}
                className={`rounded-lg border p-6 flex flex-col relative ${plano.popular ? "border-2 border-primary" : "bg-card"
                  }`}
              >
                {plano.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 inline -mt-1 mr-1" />
                    Mais Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl mb-2">{plano.title}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {plano.price}
                    {plano.priceSuffix && (
                      <span className="text-lg text-muted-foreground">
                        {plano.priceSuffix}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plano.description}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plano.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate("/auth")}
                  variant={plano.popular ? "default" : "outline"}
                  className="w-full"
                >
                  {plano.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre o PingPague.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="font-semibold text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-bold text-3xl lg:text-4xl mb-6">
              Chega de cobrar manualmente.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Recupere seu tempo e profissionalize sua gestão financeira hoje
              mesmo.
            </p>

            <Button
              size="lg"
              variant="secondary" // 'secondary' no shadcn é o branco/claro
              className="text-lg px-8 py-6 font-bold text-primary shadow-2xl transform hover:scale-105"
            >
              <a href="#precos">
                Comece agora
              </a>            </Button>
            <p className="text-sm opacity-75 mt-4">
              Comece a testar gratuitamente. Sem cartão de crédito. Sem
              complicação.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Contato */}
      <section id="contato" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="font-bold text-3xl lg:text-4xl mb-6">
              Dúvidas? Fale conosco.
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa equipe está pronta para ajudar você a automatizar suas
              cobranças.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-lg border bg-card p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-red-500 mr-3" />
                  <a
                    href="mailto:contatopingpague@gmail.com"
                    className="text-sm font-medium hover:text-primary transition"
                  >
                    contatopingpague@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium">
                    (31) 9 7321-2680 (WhatsApp)
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-muted-foreground mr-3" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Seg-Sex: 8h às 18h
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <Button
                  asChild
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <a
                    href="https://wa.me/SEUNUMERO"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Falar no WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="text-background pt-2 pb-2">
        <div className="container mx-auto px-4">
          <div className="border-t border-muted-foreground/30 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 PingPague. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-muted-foreground text-sm">
                Pagamento seguro:
              </span>
              <div className="flex space-x-2">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-800">
                    VISA
                  </span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-800">
                    MASTER
                  </span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-800">
                    PIX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 12. Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden z-50">
        <Button className="w-full" onClick={() => navigate("/auth")}>
          <Zap className="w-5 h-5 mr-2" />
          Comece agora
        </Button>
      </div>
    </div>
  );
}