// src/pages/Clients.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, AlertTriangle, Calendar, Edit } from "lucide-react";
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
  total_charged: number; // Este valor pode estar desatualizado
  total_paid: number;    // Este valor pode estar desatualizado
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
  is_canceled: boolean; // <-- ADICIONADO
}

const initialFormData = {
  name: "",
  phone: "",
  email: "",
};

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientCharges, setClientCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

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
    // ... (lógica idêntica)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadClients = async () => {
    // Esta função ainda carrega os dados possivelmente desatualizados.
    // A mágica acontece em loadClientCharges()
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

  // --- FUNÇÃO loadClientCharges ATUALIZADA ---
  const loadClientCharges = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("charges")
        .select("*, is_canceled") // <-- Buscando a nova coluna
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allCharges = data || [];

      // --- LÓGICA DE RECALCULAR TOTAIS ---
      
      // 1. Filtra apenas cobranças ativas (não canceladas)
      const activeCharges = allCharges.filter(c => !c.is_canceled);

      // 2. Calcula os totais com base nas cobranças ativas
      const totalAtivo = activeCharges.reduce((acc, c) => acc + c.amount, 0);
      const totalPago = activeCharges
        .filter(c => c.status === 'paid')
        .reduce((acc, c) => acc + c.amount, 0);
      const overdueCount = activeCharges.filter(c => c.status === 'overdue').length;
      
      // 3. Atualiza o estado principal 'clients'
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

      // 4. Define o histórico (com todas as cobranças, incluindo canceladas)
      setClientCharges(allCharges);

    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (lógica idêntica)
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
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", editingClient.id);
        
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
    // ... (lógica idêntica)
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
    });
    setOpen(true);
  };

  const handleDeleteConfirm = async () => {
    // ... (lógica idêntica)
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

  // --- getStatusBadge ATUALIZADO ---
  const getStatusBadge = (charge: Charge) => {
    
    if (charge.is_canceled) {
      return <Badge variant="outline">Cancelada</Badge>;
    }

    const badges = {
      paid: <Badge className="bg-success text-success-foreground">Pago</Badge>,
      pending: <Badge className="bg-warning text-warning-foreground">Pendente</Badge>,
      overdue: <Badge variant="destructive">Atrasado</Badge>,
    };
    return badges[charge.status as keyof typeof badges] || null;
  };

  return (
    <div className="space-y-6">
      {/* ... (Header e Dialog de Clientes) ... */}
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
               {/* ... (Formulário do Dialog) ... */}
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
                 {editingClient ? "Salvar Alterações" : "Cadastrar"}
               </Button>
             </form>
           </DialogContent>
         </Dialog>
       </div>

      {loading ? (
        <p>Carregando...</p>
      ) : clients.length === 0 ? (
        // ... (Card "Nenhum cliente") ...
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
                        {/* ... (Nome do cliente, badge de atraso) ... */}
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
                        
                        {/* ESTES VALORES AGORA SÃO RECALCULADOS E CORRIGIDOS */}
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

                      {/* ... (Botões de Editar e Excluir Cliente) ... */}
                       <div className="flex flex-col sm:flex-row">
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleEdit(client);
                           }}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="text-destructive"
                           onClick={(e) => {
                             e.stopPropagation(); 
                             setClientToDelete(client.id); 
                           }}
                         >
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
                          {/* O HISTÓRICO AGORA MOSTRA AS CANCELADAS */}
                          {clientCharges.map((charge) => (
                            <div
                              key={charge.id}
                              className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                charge.is_canceled 
                                  ? 'bg-muted/50 text-muted-foreground' 
                                  : 'hover:bg-accent/50'
                              }`}
                            >
                              <div>
                                <p className={`font-medium ${charge.is_canceled ? 'line-through' : ''}`}>
                                  R$ {Number(charge.amount).toFixed(2)}
                                </p>
                                <p className="text-xs">
                                  Vencimento: {new Date(charge.due_date).toLocaleDateString("pt-BR")}
                                </p>
                                {charge.paid_at && !charge.is_canceled && (
                                  <p className="text-xs text-success">
                                    Pago em: {new Date(charge.paid_at).toLocaleDateString("pt-BR")}
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
      )}

      {/* ... (AlertDialog de Excluir Cliente) ... */}
       <AlertDialog
         open={!!clientToDelete}
         onOpenChange={(isOpen) => !isOpen && setClientToDelete(null)}
       >
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
             <AlertDialogDescription>
               Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente.
               (Se o cliente tiver cobranças, pode ocorrer um erro se a exclusão em cascata não estiver configurada no banco).
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