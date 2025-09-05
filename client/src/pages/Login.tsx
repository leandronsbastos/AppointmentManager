import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { Headphones, Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      onLogin(response.token, response.user);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${response.user.firstName}!`,
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Verifique seu e-mail e senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">ServiceDesk Pro</CardTitle>
          <p className="text-muted-foreground">Sistema de Gestão de Atendimentos</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="email-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="password-input"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  data-testid="remember-checkbox"
                />
                <Label htmlFor="remember" className="text-sm">
                  Lembrar-me
                </Label>
              </div>
              <Button variant="link" className="px-0 text-sm" data-testid="forgot-password">
                Esqueceu a senha?
              </Button>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="login-button"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <hr className="my-4 border-border" />
              Ou entre com SSO
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              data-testid="sso-button"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M23.766 12.276c0-.815-.07-1.417-.214-2.04H12.24v3.697h6.678c-.118.982-.595 2.104-1.708 2.95l-.016.11 2.48 1.92.172.017c1.577-1.458 2.488-3.604 2.488-6.154"
                />
                <path
                  fill="currentColor"
                  d="M12.24 24c2.29 0 4.203-.75 5.604-2.04l-2.636-2.047c-.74.49-1.676.82-2.968.82-2.266 0-4.188-1.53-4.87-3.575l-.101.008-2.578 1.995-.034.094C6.751 21.73 9.266 24 12.24 24"
                />
                <path
                  fill="currentColor"
                  d="M7.37 14.158c-.18-.54-.282-1.117-.282-1.71s.102-1.17.273-1.71l-.005-.118-2.614-2.03-.085.04a11.928 11.928 0 0 0 0 10.716l2.713-2.188"
                />
                <path
                  fill="currentColor"
                  d="M12.24 4.75c1.61 0 2.699.7 3.317 1.283l2.385-2.33C16.436 2.09 14.52 1.25 12.24 1.25c-2.974 0-5.489 2.27-6.583 5.745l2.704 2.097C8.052 6.28 9.974 4.75 12.24 4.75"
                />
              </svg>
              Microsoft 365
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
