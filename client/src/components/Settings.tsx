import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageSquare,
  Users,
  Clock,
  Bot,
  Shield,
  Plus,
  Edit,
  Trash,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock Evolution instance data
  const evolutionInstance = {
    name: "ServiceDesk-Main",
    number: "+55 11 91234-5678",
    apiUrl: "https://api.evolution.com",
    webhookUrl: "https://servicedesk.com/webhook/evolution",
    status: "connected",
    lastSync: new Date(),
  };

  const messageTemplates = [
    {
      id: "1",
      name: "Boas-vindas",
      content: "Olá! Bem-vindo ao suporte da nossa empresa. Como posso ajudá-lo hoje?",
      isActive: true,
    },
    {
      id: "2",
      name: "Fora do Expediente",
      content: "Obrigado pelo contato! Nosso horário de atendimento é de 8h às 18h. Retornaremos assim que possível.",
      isActive: true,
    },
  ];

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement the API call to save the template
    toast({
      title: "Template salvo",
      description: "O template foi salvo com sucesso.",
    });
    setIsTemplateDialogOpen(false);
    setNewTemplate({ name: "", content: "" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-card-foreground">Configurações do Sistema</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="whatsapp" data-testid="tab-whatsapp">
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="sla" data-testid="tab-sla">
            <Clock className="w-4 h-4 mr-2" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="automation" data-testid="tab-automation">
            <Bot className="w-4 h-4 mr-2" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Integration */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card data-testid="whatsapp-config">
            <CardHeader>
              <CardTitle>Configuração WhatsApp (Evolution API)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Status */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-400">
                    Evolution API Conectada
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-500">
                    Última sincronização: há 2 minutos
                  </span>
                </div>
              </div>

              {/* Instance Configuration */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instanceName">Nome da Instância</Label>
                    <Input
                      id="instanceName"
                      defaultValue={evolutionInstance.name}
                      data-testid="instance-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsappNumber">Número WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      defaultValue={evolutionInstance.number}
                      data-testid="whatsapp-number-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="apiUrl">URL da Evolution API</Label>
                  <Input
                    id="apiUrl"
                    defaultValue={evolutionInstance.apiUrl}
                    data-testid="api-url-input"
                  />
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="webhookUrl"
                      defaultValue={evolutionInstance.webhookUrl}
                      readOnly
                      className="flex-1"
                      data-testid="webhook-url-input"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(evolutionInstance.webhookUrl);
                        toast({
                          title: "URL copiada",
                          description: "A URL do webhook foi copiada para a área de transferência.",
                        });
                      }}
                      data-testid="copy-webhook-url"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (msg/min)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      defaultValue="60"
                      data-testid="rate-limit-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeout">Timeout (segundos)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      defaultValue="30"
                      data-testid="timeout-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" data-testid="test-connection">
                    Testar Conexão
                  </Button>
                  <Button data-testid="save-whatsapp-config">
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card data-testid="message-templates">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Templates de Mensagem</CardTitle>
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="add-template-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Template</DialogTitle>
                      <DialogDescription>
                        Crie um novo template de mensagem para uso rápido.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveTemplate} className="space-y-4">
                      <div>
                        <Label htmlFor="templateName">Nome do Template</Label>
                        <Input
                          id="templateName"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          required
                          data-testid="template-name-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="templateContent">Conteúdo</Label>
                        <Textarea
                          id="templateContent"
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                          rows={4}
                          required
                          data-testid="template-content-input"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" data-testid="save-template-button">
                          Salvar Template
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messageTemplates.map((template) => (
                  <div key={template.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-card-foreground">{template.name}</h4>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`edit-template-${template.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`delete-template-${template.id}`}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.content}</p>
                    <Badge variant="secondary" className="text-xs">
                      {template.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users and Permissions */}
        <TabsContent value="users">
          <Card data-testid="users-config">
            <CardHeader>
              <CardTitle>Gestão de Usuários e Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Configuração de usuários será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA and Rules */}
        <TabsContent value="sla">
          <Card data-testid="sla-config">
            <CardHeader>
              <CardTitle>Configuração de SLA e Regras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Configuração de SLA será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation">
          <Card data-testid="automation-config">
            <CardHeader>
              <CardTitle>Automação e Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Configuração de automação será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card data-testid="security-config">
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Configuração de segurança será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
