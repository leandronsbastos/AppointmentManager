import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { customersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Eye, History, Search } from "lucide-react";

export function CustomerManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    document: "",
    segment: "residential" as const,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["/api/customers", { page, search, segment: segmentFilter }],
    queryFn: () => customersApi.getCustomers({ page, search, segment: segmentFilter }),
  });

  const createCustomerMutation = useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsCreateDialogOpen(false);
      setNewCustomer({ name: "", email: "", document: "", segment: "residential" });
      toast({
        title: "Cliente criado",
        description: "Cliente foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cliente",
        description: "Não foi possível criar o cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerMutation.mutate(newCustomer);
  };

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case "residential": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "business": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "enterprise": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case "residential": return "Residencial";
      case "business": return "Empresarial";
      case "enterprise": return "Corporativo";
      default: return segment;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">Gestão de Clientes</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="new-customer-button">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
              <DialogDescription>
                Adicione um novo cliente ao sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                  data-testid="customer-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  data-testid="customer-email-input"
                />
              </div>
              <div>
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input
                  id="document"
                  value={newCustomer.document}
                  onChange={(e) => setNewCustomer({ ...newCustomer, document: e.target.value })}
                  data-testid="customer-document-input"
                />
              </div>
              <div>
                <Label htmlFor="segment">Segmento</Label>
                <Select
                  value={newCustomer.segment}
                  onValueChange={(value: any) => setNewCustomer({ ...newCustomer, segment: value })}
                >
                  <SelectTrigger data-testid="customer-segment-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residencial</SelectItem>
                    <SelectItem value="business">Empresarial</SelectItem>
                    <SelectItem value="enterprise">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCustomerMutation.isPending} data-testid="create-customer-submit">
                  Criar Cliente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="search-customers"
              />
            </div>
            <Input
              placeholder="WhatsApp ou telefone..."
              data-testid="search-phone"
            />
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger data-testid="segment-filter">
                <SelectValue placeholder="Todos os Segmentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Segmentos</SelectItem>
                <SelectItem value="residential">Residencial</SelectItem>
                <SelectItem value="business">Empresarial</SelectItem>
                <SelectItem value="enterprise">Corporativo</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Documento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Segmento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="p-4">
                        <div className="animate-pulse flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-32"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-40 animate-pulse"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-28 animate-pulse"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : customersData?.customers?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  customersData?.customers?.map((customer: any) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-accent" data-testid={`customer-row-${customer.id}`}>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-white font-medium">
                              {customer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-card-foreground">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {customer.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-card-foreground">
                        {customer.email || "N/A"}
                      </td>
                      <td className="p-4 text-sm text-card-foreground">
                        {customer.document || "N/A"}
                      </td>
                      <td className="p-4">
                        <Badge className={cn("text-xs", getSegmentBadge(customer.segment))}>
                          {getSegmentLabel(customer.segment)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                          Ativo
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`edit-customer-${customer.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`view-customer-${customer.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`history-customer-${customer.id}`}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {customersData && customersData.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * 20) + 1}-{Math.min(page * 20, customersData.total)} de {customersData.total} clientes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              data-testid="prev-page"
            >
              Anterior
            </Button>
            <span className="px-3 py-2 text-sm font-medium">
              {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= customersData.total}
              data-testid="next-page"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
