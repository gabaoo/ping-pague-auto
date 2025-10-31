import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function ProfileCompleteModal() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile && !profile.profile_completed) {
        // Check if all required fields are filled
        const isComplete = profile.full_name && 
                          profile.phone && 
                          profile.bank_name && 
                          profile.bank_agency && 
                          profile.bank_account && 
                          profile.bank_account_type && 
                          profile.pix_key;

        if (!isComplete) {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const handleComplete = () => {
    setShowModal(false);
    navigate("/profile");
  };

  return (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Complete seu Perfil
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            ⚠️ Antes de continuar, complete seu perfil com <strong>nome</strong>, <strong>telefone</strong> e <strong>dados bancários</strong> para receber seus pagamentos.
            <br /><br />
            Isso é necessário para que você possa enviar cobranças e receber pagamentos via PIX.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={handleComplete} className="w-full">
            Completar Perfil Agora
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
