import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  total_charged: number;
  total_paid: number;
  last_payment_date: string | null;
  overdue_count: number;
}

interface Charge {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientCharges, setClientCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    checkAuth();
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientCharges(selectedClient);
    }
  }, [selectedClient]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const loadClientCharges = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("charges")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClientCharges(data || []);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("clients").insert({
        user_id: user.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
      });

      if (error) throw error;

      toast.success("Cliente cadastrado com sucesso!");
      setFormData({ name: "", phone: "", email: "" });
      setOpen(false);
      loadClients();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar cliente");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este cliente?")) return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;

      toast.success("Cliente removido");
      loadClients();
    } catch (error) {
      toast.error("Erro ao remover cliente");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: <Badge className="bg-success text-success-foreground">Pago</Badge>,
      pending: <Badge className="bg-warning text-warning-foreground">Pendente</Badge>,
      overdue: <Badge variant="destructive">Atrasado</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Cliente</DialogTitle>
                <DialogDescription>Adicione um novo cliente à sua base</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do cliente"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Cadastrar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : clients.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum cliente cadastrado</CardTitle>
              <CardDescription>
                Comece adicionando seu primeiro cliente clicando no botão "Novo Cliente"
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {clients.map((client) => (
              <AccordionItem key={client.id} value={client.id} className="border rounded-lg">
                <Card>
                  <CardHeader>
                    <AccordionTrigger
                      onClick={() => setSelectedClient(client.id)}
                      className="hover:no-underline"
                    >
                      <div className="flex items-start justify-between w-full pr-4">
                        <div className="text-left">
                          <CardTitle className="flex items-center gap-2">
                            {client.name}
                            {client.overdue_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {client.overdue_count} atrasada{client.overdue_count > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{client.phone}</CardDescription>
                          {client.email && (
                            <CardDescription className="mt-1">{client.email}</CardDescription>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Cobrado</p>
                              <p className="font-bold text-lg">R$ {Number(client.total_charged || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Pago</p>
                              <p className="font-bold text-lg text-success">
                                R$ {Number(client.total_paid || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {client.last_payment_date && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Último pagamento: {new Date(client.last_payment_date).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  
                  <AccordionContent>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-t pt-4">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">Histórico de Cobranças</h3>
                        </div>

                        {clientCharges.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">
                            Nenhuma cobrança registrada para este cliente
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {clientCharges.map((charge) => (
                              <div
                                key={charge.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                <div>
                                  <p className="font-medium">R$ {Number(charge.amount).toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Vencimento: {new Date(charge.due_date).toLocaleDateString("pt-BR")}
                                  </p>
                                  {charge.paid_at && (
                                    <p className="text-xs text-success">
                                      Pago em: {new Date(charge.paid_at).toLocaleDateString("pt-BR")}
                                    </p>
                                  )}
                                </div>
                                {getStatusBadge(charge.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Layout>
  );
}
