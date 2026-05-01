import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("register");

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fn = tab === "login" ? signIn : signUp;
    const { error } = await fn(phone, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(tab === "login" ? "Sesión iniciada" : "Cuenta creada con éxito");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-primary">
      <header className="px-4 py-3">
        <Link to="/" className="inline-flex items-center text-white/90 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al mapa
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <Card className="w-full max-w-md shadow-transport">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Acceso a Ruta 22</CardTitle>
            <CardDescription>
              Regístrate con tu teléfono para ver las unidades en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono celular</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="664 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "login" ? "Entrar" : "Crear cuenta"}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Al continuar aceptas nuestra{" "}
                <Link to="/privacy-policy" className="underline">política de privacidad</Link>.
              </p>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
