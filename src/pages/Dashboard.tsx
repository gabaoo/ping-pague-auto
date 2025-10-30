import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, CreditCard, CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Charge {
  id: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  created_at: string;
  due_date: string;
  is_canceled: boolean;
  clients: {
    name: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCharges: 0,
    paidCharges: 0,
    pendingCharges: 0,
    overdueCharges: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentCharges, setRecentCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    // ... (lógica idêntica)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.rpc("update_overdue_charges");

      const [clientsResult, chargesResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("charges").select("*, clients(name), is_canceled", { count: "exact" }),
      ]);

      const allCharges: Charge[] = chargesResult.data || [];
      const activeCharges = allCharges.filter(c => !c.is_canceled);

      // ... (Cálculo de stats idêntico)
      const paidCharges = activeCharges.filter((c) => c.status === "paid");
      const pendingCharges = activeCharges.filter((c) => c.status === "pending");
      const overdueCharges = activeCharges.filter((c) => c.status === "overdue");
      const totalAmount = activeCharges.reduce((sum, c) => sum + Number(c.amount), 0);
      const paidAmount = paidCharges.reduce((sum, c) => sum + Number(c.amount), 0);
      const pendingAmount = pendingCharges.reduce((sum, c) => sum + Number(c.amount), 0);
      const overdueAmount = overdueCharges.reduce((sum, c) => sum + Number(c.amount), 0);
      setStats({
        totalClients: clientsResult.count || 0,
        totalCharges: activeCharges.length,
        paidCharges: paidCharges.length,
        pendingCharges: pendingCharges.length,
        overdueCharges: overdueCharges.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
      });

      // Prepare chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        // CORREÇÃO: Usar setUTCDate para evitar problemas de fuso
        date.setUTCDate(date.getUTCDate() - (6 - i)); 
        return date.toISOString().split("T")[0];
      });

      const chartData = last7Days.map((date) => {
        const dayCharges = activeCharges.filter((c) => c.created_at?.startsWith(date));
        const paid = dayCharges.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.amount), 0);
        return {
          // CORREÇÃO: Adicionar timeZone: "UTC" para exibir a data correta no gráfico
          date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }),
          valor: paid,
        };
      });

      setChartData(chartData);

      // Recent charges (last 5)
      const recent = allCharges
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentCharges(recent);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    // ... (array statCards idêntico)
    {
      title: "Total Recebido",
      value: `R$ ${stats.paidAmount.toFixed(2)}`,
      icon: CheckCircle,
      description: `${stats.paidCharges} cobranças pagas`,
      color: "text-success",
    },
    {
      title: "Pendente",
      value: `R$ ${stats.pendingAmount.toFixed(2)}`,
      icon: Clock,
      description: `${stats.pendingCharges} cobranças pendentes`,
      color: "text-warning",
    },
    {
      title: "Em Atraso",
      value: `R$ ${stats.overdueAmount.toFixed(2)}`,
      icon: AlertCircle,
      description: `${stats.overdueCharges} cobranças atrasadas`,
      color: "text-destructive",
    },
    {
      title: "Total de Clientes",
      value: stats.totalClients,
      icon: Users,
      description: "Clientes cadastrados",
      color: "text-primary",
    },
  ];

  const pieData = [
    // ... (array pieData idêntico)
    { name: "Pago", value: stats.paidAmount, color: "hsl(var(--success))" },
    { name: "Pendente", value: stats.pendingAmount, color: "hsl(var(--warning))" },
    { name: "Atrasado", value: stats.overdueAmount, color: "hsl(var(--destructive))" },
  ].filter((item) => item.value > 0);

  const getStatusBadge = (charge: Charge) => {
    // ... (função getStatusBadge idêntica)
    if (charge.is_canceled) {
      return <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">Cancelada</span>;
    }
    const badges = {
      paid: <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">Pago</span>,
      pending: <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">Pendente</span>,
      overdue: <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">Atrasado</span>,
    };
    return badges[charge.status as keyof typeof badges] || null;
  };

  return (
    <div className="space-y-8">
      {/* ... (Header) ... */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas cobranças</p>
      </div>

      {/* ... (Stat Cards) ... */}
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

      {/* ... (Gráficos) ... */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          {/* ... (Gráfico de Linha) ... */}
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-primary" />
               Recebimentos (últimos 7 dias)
             </CardTitle>
           </CardHeader>
           <CardContent>
             {loading ? (
               <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                 Carregando...
               </div>
             ) : chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height={200}>
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                   <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                   <YAxis stroke="hsl(var(--muted-foreground))" />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: "hsl(var(--card))", 
                       border: "1px solid hsl(var(--border))",
                       borderRadius: "8px"
                     }}
                     formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                   />
                   <Line type="monotone" dataKey="valor" stroke="hsl(var(--success))" strokeWidth={2} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                 Nenhum dado disponível
               </div>
             )}
           </CardContent>
        </Card>
        <Card>
          {/* ... (Gráfico de Pizza) ... */}
           <CardHeader>
             <CardTitle>Distribuição de Valores</CardTitle>
           </CardHeader>
           <CardContent>
             {loading ? (
               <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                 Carregando...
               </div>
             ) : pieData.length > 0 ? (
               <ResponsiveContainer width="100%" height={200}>
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                     outerRadius={80}
                     fill="#8884d8"
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                 Nenhum dado disponível
               </div>
             )}
           </CardContent>
        </Card>
      </div>

      {/* ... (Card Cobranças Recentes) ... */}
      <Card>
        <CardHeader>
          <CardTitle>Cobranças Recentes</CardTitle>
          <CardDescription>Últimas 5 cobranças criadas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : recentCharges.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma cobrança encontrada</p>
          ) : (
            <div className="space-y-3">
              {recentCharges.map((charge) => (
                <div key={charge.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{charge.clients?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {/* CORREÇÃO AQUI */}
                      Vencimento: {new Date(charge.due_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className={`font-bold ${charge.is_canceled ? 'line-through text-muted-foreground' : ''}`}>
                      R$ {Number(charge.amount).toFixed(2)}
                    </p>
                    {getStatusBadge(charge)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}