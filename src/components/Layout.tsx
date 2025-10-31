import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  History,
  UserCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileCompleteModal } from "@/components/ProfileCompleteModal";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
      return;
    }
    navigate("/auth");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/clients", icon: Users, label: "Clientes" },
    { path: "/charges", icon: CreditCard, label: "Cobranças" },
    { path: "/historic", icon: History, label: "Histórico" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <ProfileCompleteModal />

      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card p-4 flex flex-col justify-between">
        {/* Topo */}
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">PingPague</h1>
            <p className="text-sm text-muted-foreground">Cobranças Automáticas</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé (Perfil + Sair) */}
        <div className="space-y-2">
          <Button
            variant={isActive("/profile") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate("/profile")}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Meu Perfil
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
