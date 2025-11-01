import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, AlertTriangle, Calendar, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  status: "pending" | "paid" | "overdue" | "canceled";
  due_date: string;
  paid_at: string | null;
  canceled_at: string | null;
  created_at: string;
}

const initialFormData = {
  name: "",
  phone: "",
  email: "",
};

const ITEMS_PER_PAGE = 20;

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientCharges, setClientCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Pagination and Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  useEffect(() => {
    checkAuth();
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientCharges(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    applyFilters();
  }, [clients, searchName, searchPhone]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];

    // Filter by name
    if (searchName) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by phone
    if (searchPhone) {
      filtered = filtered.filter(client =>
        client.phone.includes(searchPhone)
      );
    }

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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
        .order("due_date", { ascending: false });

      if (error) throw error;

      const allCharges = data || [];
      
      const totalAtivo = allCharges.reduce((acc, c) => acc + c.amount, 0);
      const totalPago = allCharges
        .filter(c => c.status === 'paid')
        .reduce((acc, c) => acc + c.amount, 0);
      const overdueCount = allCharges.filter(c => c.status === 'overdue').length;
      
      setClients(currentClients => 
        currentClients.map(client => 
          client.id === clientId 
          ? { ...client, 
              total_charged: totalAtivo, 
              total_paid: totalPago,
              overdue_count: overdueCount 
            }
          : client
        )
      );
      setClientCharges(allCharges);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      const clientData = {
        user_id: user.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
      };
      if (editingClient) {
        const { error } = await supabase.from("clients").update(clientData).eq("id", editingClient.id);
        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("clients").insert(clientData);
        if (error) throw error;
        toast.success("Cliente cadastrado com sucesso!");
      }
      setFormData(initialFormData);
      setEditingClient(null);
      setOpen(false);
      loadClients();
    } catch (error: any) {
      toast.error(error.message || (editingClient ? "Erro ao atualizar cliente" : "Erro ao cadastrar cliente"));
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
    });
    setOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientToDelete);
      if (error) throw error;
      toast.success("Cliente removido");
      loadClients();
    } catch (error) {
      toast.error("Erro ao remover cliente. Verifique se ele não possui cobranças ativas.");
    } finally {
      setClientToDelete(null); 
    }
  };

  const getStatusBadge = (charge: Charge) => {
    const badges = {
      paid: <Badge className="bg-success text-success-foreground">Pago</Badge>,
      pending: <Badge className="bg-warning text-warning-foreground">Pendente</Badge>,
      overdue: <Badge variant="destructive">Atrasado</Badge>,
      canceled: <Badge variant="outline" className="bg-muted/50">Cancelada</Badge>,
    };
    return badges[charge.status as keyof typeof badges] || null;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        <Dialog 
          open={open} 
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setEditingClient(null);
              setFormData(initialFormData);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Editar Cliente" : "Cadastrar Cliente"}</DialogTitle>
              <DialogDescription>
                {editingClient ? "Atualize os dados do cliente" : "Adicione um novo cliente à sua base"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" placeholder="Nome do cliente" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                <Input id="phone" placeholder="(00) 00000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input id="email" type="email" placeholder="cliente@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">
                {editingClient ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Buscar por Nome</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-name"
                  placeholder="Digite o nome..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-phone">Buscar por Telefone</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-phone"
                  placeholder="Digite o telefone..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p>Carregando...</p>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum cliente encontrado</CardTitle>
            <CardDescription>
              {clients.length === 0 
                ? "Comece adicionando seu primeiro cliente clicando no botão \"Novo Cliente\""
                : "Nenhum cliente corresponde aos filtros aplicados"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Accordion type="single" collapsible className="space-y-4">
            {currentClients.map((client) => (
              <AccordionItem key={client.id} value={client.id} className="border rounded-lg">
                <Card>
                  <CardHeader>
                    <AccordionTrigger onClick={() => setSelectedClient(client.id)} className="hover:no-underline">
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
                              Último pagamento: {new Date(client.last_payment_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(client); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); setClientToDelete(client.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                                  <p className="font-medium">
                                    R$ {Number(charge.amount).toFixed(2)}
                                  </p>
                                  <p className="text-xs">
                                    Vencimento: {new Date(charge.due_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                  </p>
                                  {charge.paid_at && (
                                    <p className="text-xs text-success">
                                      Pago em: {new Date(charge.paid_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                    </p>
                                  )}
                                  {charge.canceled_at && (
                                    <p className="text-xs text-muted-foreground">
                                      Cancelada em: {new Date(charge.canceled_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                    </p>
                                  )}
                                </div>
                                {getStatusBadge(charge)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({filteredClients.length} clientes)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(isOpen) => !isOpen && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
