import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ticketsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Plus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketListProps {
  onSelectTicket: (ticket: any) => void;
  selectedTicketId?: string;
}

export function TicketList({ onSelectTicket, selectedTicketId }: TicketListProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["/api/tickets", { status: statusFilter, priority: priorityFilter }],
    queryFn: () => ticketsApi.getTickets({ status: statusFilter, priority: priorityFilter }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending_customer": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "normal": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "open": return "w-2 h-2 bg-yellow-500 rounded-full";
      case "in_progress": return "w-2 h-2 bg-blue-500 rounded-full";
      case "pending_customer": return "w-2 h-2 bg-orange-500 rounded-full";
      case "resolved": return "w-2 h-2 bg-green-500 rounded-full";
      case "closed": return "w-2 h-2 bg-gray-500 rounded-full";
      default: return "w-2 h-2 bg-gray-500 rounded-full";
    }
  };

  if (isLoading) {
    return (
      <div className="w-1/3 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/3 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Tickets</h2>
          <Button size="sm" data-testid="new-ticket-button">
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="status-filter">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="in_progress">Em Atendimento</SelectItem>
              <SelectItem value="pending_customer">Pendentes</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger data-testid="priority-filter">
              <SelectValue placeholder="Todas as Prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-y-auto h-full">
        {ticketsData?.tickets?.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum ticket encontrado</p>
          </div>
        ) : (
          ticketsData?.tickets?.map((item: any) => (
            <div
              key={item.ticket.id}
              className={cn(
                "p-4 border-b border-border hover:bg-accent cursor-pointer transition-colors",
                selectedTicketId === item.ticket.id && "bg-accent"
              )}
              onClick={() => onSelectTicket(item)}
              data-testid={`ticket-item-${item.ticket.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={getStatusIndicator(item.ticket.status)}></div>
                  <span className="text-sm font-medium text-card-foreground">
                    {item.ticket.number}
                  </span>
                  <Badge className={cn("text-xs", getPriorityColor(item.ticket.priority))}>
                    {item.ticket.priority === "high" ? "Alta" :
                     item.ticket.priority === "critical" ? "Crítica" :
                     item.ticket.priority === "low" ? "Baixa" : "Normal"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.ticket.createdAt && formatDistanceToNow(new Date(item.ticket.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>

              <h4 className="text-sm font-medium text-card-foreground mb-1 line-clamp-2">
                {item.ticket.title}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-2">
                Cliente: {item.customer?.name || "N/A"}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  WhatsApp
                </Badge>
                <span className="text-xs text-orange-600">
                  SLA: 2h 15m
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
