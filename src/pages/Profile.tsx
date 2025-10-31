import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, Building2, CreditCard, Key } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    bank_name: "",
    bank_agency: "",
    bank_account: "",
    bank_account_type: "",
    pix_key: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          bank_name: data.bank_name || "",
          bank_agency: data.bank_agency || "",
          bank_account: data.bank_account || "",
          bank_account_type: data.bank_account_type || "",
          pix_key: data.pix_key || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erro ao carregar perfil");
    }
  };

  const handleSave = async () => {
    if (!profile.full_name || !profile.phone || !profile.bank_name || 
        !profile.bank_agency || !profile.bank_account || !profile.bank_account_type || 
        !profile.pix_key) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          profile_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = profile.full_name && profile.phone && profile.bank_name && 
                       profile.bank_agency && profile.bank_account && 
                       profile.bank_account_type && profile.pix_key;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Meu Perfil
          </CardTitle>
          <CardDescription>
            Complete seus dados para receber pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Informações Pessoais
            </h3>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Dados Bancários
            </h3>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Banco *</Label>
              <Input
                id="bank_name"
                value={profile.bank_name}
                onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                placeholder="Ex: Banco do Brasil, Nubank, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_agency">Agência *</Label>
                <Input
                  id="bank_agency"
                  value={profile.bank_agency}
                  onChange={(e) => setProfile({ ...profile, bank_agency: e.target.value })}
                  placeholder="0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account">Conta *</Label>
                <Input
                  id="bank_account"
                  value={profile.bank_account}
                  onChange={(e) => setProfile({ ...profile, bank_account: e.target.value })}
                  placeholder="00000-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_type">Tipo de Conta *</Label>
              <Select
                value={profile.bank_account_type}
                onValueChange={(value) => setProfile({ ...profile, bank_account_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="salario">Conta Salário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PIX Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4" />
              Chave PIX
            </h3>
            <div className="space-y-2">
              <Label htmlFor="pix_key">Chave PIX *</Label>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="pix_key"
                  value={profile.pix_key}
                  onChange={(e) => setProfile({ ...profile, pix_key: e.target.value })}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!isFormValid || loading}
            className="w-full"
          >
            {loading ? "Salvando..." : "Salvar e Continuar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
