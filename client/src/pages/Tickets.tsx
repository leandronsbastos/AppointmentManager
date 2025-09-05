import { useState, useEffect } from "react";
import { TicketList } from "@/components/TicketList";
import { TicketChat } from "@/components/TicketChat";

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      <TicketList 
        onSelectTicket={setSelectedTicket}
        selectedTicketId={selectedTicket?.ticket?.id}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <TicketChat ticket={selectedTicket} token={token!} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-muted-foreground">Selecione um ticket para ver a conversa</p>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Sidebar */}
      {selectedTicket && (
        <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Detalhes do Ticket</h3>
          
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">Informações do Cliente</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="text-card-foreground">{selectedTicket.customer?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <span className="text-card-foreground">{selectedTicket.contact?.whatsappNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="text-card-foreground">{selectedTicket.customer?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Segmento:</span>
                  <span className="text-card-foreground">
                    {selectedTicket.customer?.segment === "residential" ? "Residencial" :
                     selectedTicket.customer?.segment === "business" ? "Empresarial" :
                     selectedTicket.customer?.segment === "enterprise" ? "Corporativo" : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">Informações do Ticket</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="text-card-foreground">{selectedTicket.category?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atendente:</span>
                  <span className="text-card-foreground">
                    {selectedTicket.assignedAgent ? 
                      `${selectedTicket.assignedAgent.firstName} ${selectedTicket.assignedAgent.lastName}` : 
                      "Não atribuído"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="text-card-foreground">
                    {selectedTicket.ticket.createdAt && 
                      new Date(selectedTicket.ticket.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {/* SLA Info */}
            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">SLA</h4>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Primeira Resposta
                  </span>
                  <span className="text-sm text-green-600">✓ Atendido</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Resolução
                  </span>
                  <span className="text-sm text-orange-600">2h 15m restantes</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">Ações</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" data-testid="transfer-ticket-action">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Transferir Ticket
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="escalate-priority">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Escalar Prioridade
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="add-tags">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Adicionar Tags
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="view-history">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Histórico
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                  internet
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                  conexão
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs">
                  modem
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
