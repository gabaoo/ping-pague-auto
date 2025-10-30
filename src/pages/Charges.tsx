import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, CheckCircle, Clock, AlertCircle, Repeat, Download, Send, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
}

interface Charge {
  id: string;
  client_id: string; 
  amount: number;
  status: "pending" | "paid" | "overdue";
  due_date: string;
  payment_link: string | null;
  notes: string | null;
  is_recurrent: boolean;
  recurrence_interval: string | null;
  recurrence_day: number | null;
  next_charge_date: string | null;
  is_canceled: boolean;
  clients: {
    name: string;
    phone: string;
  };
}

const initialFormData = {
  client_id: "",
  amount: "",
  due_date: "",
  notes: "",
  is_recurrent: false,
  recurrence_interval: "monthly",
  recurrence_day: "1",
};

export default function Charges() {
  const navigate = useNavigate();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [chargeToDelete, setChargeToDelete] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadData = async () => {
    // ... (função loadData idêntica)
    try {
      const [chargesResult, clientsResult] = await Promise.all([
        supabase
          .from("charges")
          .select(`
            id,
            client_id, 
            amount,
            status,
            due_date,
            payment_link,
            notes,
            is_recurrent,
            recurrence_interval,
            recurrence_day,
            next_charge_date,
            is_canceled, 
            clients (name, phone)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name"),
      ]);

      if (chargesResult.error) throw chargesResult.error;
      if (clientsResult.error) throw clientsResult.error;

      setCharges(chargesResult.data || []);
      setClients(clientsResult.data || []);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (handleSubmit idêntica)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const chargeData: any = {
        user_id: user.id,
        client_id: formData.client_id,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        notes: formData.notes || null,
        payment_link: "https://exemplo.com/pagar", 
        is_recurrent: formData.is_recurrent,
        is_canceled: false
      };

      if (formData.is_recurrent) {
        chargeData.recurrence_interval = formData.recurrence_interval;
        chargeData.recurrence_day = parseInt(formData.recurrence_day);
        
        // CORREÇÃO: Usar o fuso UTC para calcular a próxima data
        const [year, month, day] = formData.due_date.split('-').map(Number);
        const nextDate = new Date(Date.UTC(year, month - 1, day));
        
        switch (formData.recurrence_interval) {
          case "weekly": nextDate.setUTCDate(nextDate.getUTCDate() + 7); break;
          case "biweekly": nextDate.setUTCDate(nextDate.getUTCDate() + 14); break;
          case "monthly": nextDate.setUTCMonth(nextDate.getUTCMonth() + 1); break;
          case "quarterly": nextDate.setUTCMonth(nextDate.getUTCMonth() + 3); break;
          case "yearly": nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1); break;
        }
        chargeData.next_charge_date = nextDate.toISOString().split('T')[0];
      } else {
        chargeData.recurrence_interval = null;
        chargeData.recurrence_day = null;
        chargeData.next_charge_date = null;
      }

      if (editingCharge) {
        const { error } = await supabase
          .from("charges")
          .update(chargeData)
          .eq("id", editingCharge.id);

        if (error) throw error;
        toast.success("Cobrança atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("charges").insert(chargeData);
        if (error) throw error;
        toast.success("Cobrança criada com sucesso!");
      }

      resetFormData();
      setEditingCharge(null);
      setOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || (editingCharge ? "Erro ao atualizar cobrança" : "Erro ao criar cobrança"));
    }
  };

  const exportToCSV = () => {
    // ... (função exportToCSV idêntica)
    const headers = ["Cliente", "Valor", "Vencimento", "Status", "Recorrente", "Observações"];
    const rows = charges.map((charge) => [
      charge.clients.name,
      `R$ ${charge.amount.toFixed(2)}`,
      new Date(charge.due_date).toLocaleDateString("pt-BR", { timeZone: "UTC" }), // CORREÇÃO AQUI
      charge.is_canceled ? "Cancelada" : (charge.status === "paid" ? "Pago" : charge.status === "pending" ? "Pendente" : "Atrasado"),
      charge.is_recurrent ? "Sim" : "Não",
      charge.notes || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cobrancas_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success("Relatório exportado!");
  };

  const sendReminder = async (chargeId: string, clientPhone: string) => {
    // ... (função sendReminder idêntica)
    toast.info("Lembrete enviado via WhatsApp!");
  };

  const handleDeleteConfirm = async () => {
    // ... (função handleDeleteConfirm idêntica)
    if (!chargeToDelete) return;
    try {
      const { error } = await supabase
        .from("charges")
        .update({ is_canceled: true }) 
        .eq("id", chargeToDelete);
      
      if (error) throw error;
      toast.success("Cobrança cancelada com sucesso!");
      loadData(); 
    } catch (error) {
      toast.error("Erro ao cancelar cobrança");
    } finally {
      setChargeToDelete(null);
    }
  };

  // --- MUDANÇA NA FUNÇÃO handleEdit ---
  const handleEdit = (charge: Charge) => {
    setEditingCharge(charge);
    setFormData({
      client_id: charge.client_id,
      amount: charge.amount.toString(),
      // CORREÇÃO: Pega apenas a parte "YYYY-MM-DD" da data
      due_date: charge.due_date.split('T')[0], 
      notes: charge.notes || "",
      is_recurrent: charge.is_recurrent,
      recurrence_interval: charge.recurrence_interval || "monthly",
      recurrence_day: (charge.recurrence_day || 1).toString(),
    });
    setOpen(true);
  };

  const getStatusBadge = (charge: Charge) => {
    // ... (função getStatusBadge idêntica)
    if (charge.is_canceled) {
      return (
        <Badge variant="outline">
          Cancelada
        </Badge>
      );
    }
    switch (charge.status) {
      case "paid":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="mr-1 h-3 w-3" />
            Pago
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Vencido
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ... (Header, Botão Exportar, Dialog) ... */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Cobranças</h1>
           <p className="text-muted-foreground">Gerencie suas cobranças</p>
         </div>

         <div className="flex gap-2">
           <Button variant="outline" onClick={exportToCSV}>
             <Download className="mr-2 h-4 w-4" />
             Exportar CSV
           </Button>

          <Dialog 
             open={open} 
             onOpenChange={(isOpen) => {
               setOpen(isOpen);
               if (!isOpen) {
                 setEditingCharge(null);
                 resetFormData();
               }
             }}
           >
             <DialogTrigger asChild>
               <Button>
                 <Plus className="mr-2 h-4 w-4" />
                 Nova Cobrança
               </Button>
             </DialogTrigger>
             <DialogContent className="max-h-[90vh] overflow-y-auto">
              {/* ... (Formulário do Dialog idêntico) ... */}
               <DialogHeader>
                 <DialogTitle>{editingCharge ? "Editar Cobrança" : "Criar Cobrança"}</DialogTitle>
                 <DialogDescription>
                   {editingCharge ? "Atualize os dados da cobrança" : "Adicione uma nova cobrança para enviar ao cliente"}
                 </DialogDescription>
               </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="client">Cliente *</Label>
                   <Select
                     value={formData.client_id}
                     onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                     required
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione um cliente" />
                     </SelectTrigger>
                     <SelectContent>
                       {clients.map((client) => (
                         <SelectItem key={client.id} value={client.id}>
                           {client.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="amount">Valor (R$) *</Label>
                   <Input
                     id="amount"
                     type="number"
                     step="0.01"
                     placeholder="100.00"
                     value={formData.amount}
                     onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                     required
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="due_date">Data de Vencimento *</Label>
                   <Input
                     id="due_date"
                     type="date"
                     value={formData.due_date}
                     onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                     required
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="notes">Observações</Label>
                   <Textarea
                     id="notes"
                     placeholder="Informações adicionais"
                     value={formData.notes}
                     onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                   />
                 </div>

                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="is_recurrent"
                     checked={formData.is_recurrent}
                     onCheckedChange={(checked) => 
                       setFormData({ ...formData, is_recurrent: checked as boolean })
                     }
                   />
                   <Label htmlFor="is_recurrent" className="cursor-pointer flex items-center gap-2">
                     <Repeat className="h-4 w-4" />
                     Cobrança Recorrente
                   </Label>
                 </div>

                 {formData.is_recurrent && (
                   <>
                     <div className="space-y-2">
                       <Label htmlFor="recurrence_interval">Intervalo de Recorrência</Label>
                       <Select
                         value={formData.recurrence_interval}
                         onValueChange={(value) => 
                           setFormData({ ...formData, recurrence_interval: value })
                         }
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="weekly">Semanal</SelectItem>
                           <SelectItem value="biweekly">Quinzenal</SelectItem>
                           <SelectItem value="monthly">Mensal</SelectItem>
                           <SelectItem value="quarterly">Trimestral</SelectItem>
                           <SelectItem value="yearly">Anual</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="recurrence_day">Dia da Recorrência (1-31)</Label>
                       <Input
                         id="recurrence_day"
                         type="number"
                         min="1"
                         max="31"
                         value={formData.recurrence_day}
                         onChange={(e) => 
                           setFormData({ ...formData, recurrence_day: e.target.value })
                         }
                       />
                     </div>
                   </>
                 )}
                 <Button type="submit" className="w-full">
                   {editingCharge ? "Salvar Alterações" : "Criar e Enviar"}
                 </Button>
               </form>
             </DialogContent>
           </Dialog>
         </div>
       </div>

      {loading ? (
        <p>Carregando...</p>
      ) : charges.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma cobrança cadastrada</CardTitle>
            <CardDescription>
              Comece criando sua primeira cobrança clicando no botão "Nova Cobrança"
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {charges.map((charge) => (
            <Card key={charge.id}>
              <CardHeader>
                {/* ... (Header do Card idêntico) ... */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                       <CardTitle>{charge.clients.name}</CardTitle>
                       {charge.is_recurrent && (
                         <Badge variant="outline" className="text-primary">
                           <Repeat className="mr-1 h-3 w-3" />
                           Recorrente
                         </Badge>
                       )}
                     </div>
                     <CardDescription>{charge.clients.phone}</CardDescription>
                   </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(charge)}
                    {charge.status !== "paid" && !charge.is_canceled && ( 
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendReminder(charge.id, charge.clients.phone)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {!charge.is_canceled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(charge)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {!charge.is_canceled && ( 
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setChargeToDelete(charge.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-semibold">
                      R$ {charge.amount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  {/* --- MUDANÇA NA EXIBIÇÃO DA DATA --- */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vencimento:</span>
                    {/* CORREÇÃO: Adicionado timeZone: "UTC" */}
                    <span>{new Date(charge.due_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                  </div>
                  {charge.is_recurrent && charge.next_charge_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próxima Cobrança:</span>
                      {/* CORREÇÃO: Adicionado timeZone: "UTC" */}
                      <span>{new Date(charge.next_charge_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                    </div>
                  )}
                  {charge.notes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Obs:</span>
                      <span>{charge.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ... (AlertDialog idêntico) ... */}
      <AlertDialog
        open={!!chargeToDelete}
        onOpenChange={(isOpen) => !isOpen && setChargeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá **cancelar** a
              cobrança. Ela permanecerá no histórico como "Cancelada".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar Cobrança
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}