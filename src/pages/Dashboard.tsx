import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, CreditCard, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCharges: 0,
    paidCharges: 0,
    pendingCharges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [clientsResult, chargesResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("charges").select("id, status", { count: "exact" }),
      ]);

      const paidCount = chargesResult.data?.filter((c) => c.status === "paid").length || 0;
      const pendingCount = chargesResult.data?.filter((c) => c.status === "pending").length || 0;

      setStats({
        totalClients: clientsResult.count || 0,
        totalCharges: chargesResult.count || 0,
        paidCharges: paidCount,
        pendingCharges: pendingCount,
      });
    } catch (error) {
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats.totalClients,
      icon: Users,
      description: "Clientes cadastrados",
      color: "text-primary",
    },
    {
      title: "Total de Cobranças",
      value: stats.totalCharges,
      icon: CreditCard,
      description: "Cobranças criadas",
      color: "text-accent",
    },
    {
      title: "Cobranças Pagas",
      value: stats.paidCharges,
      icon: CheckCircle,
      description: "Pagamentos confirmados",
      color: "text-success",
    },
    {
      title: "Cobranças Pendentes",
      value: stats.pendingCharges,
      icon: Clock,
      description: "Aguardando pagamento",
      color: "text-warning",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas cobranças</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao PingPague!</CardTitle>
            <CardDescription>
              Automatize suas cobranças e economize tempo. Comece cadastrando seus clientes e criando
              suas primeiras cobranças.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
}
