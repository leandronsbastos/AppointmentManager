import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ticketsApi, uploadApi } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  User,
  UserPlus,
  Check,
  ExternalLink,
  StickyNote,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketChatProps {
  ticket: any;
  token: string;
}

export function TicketChat({ ticket, token }: TicketChatProps) {
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { joinTicket, leaveTicket, sendTyping } = useWebSocket(token);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/tickets", ticket.ticket.id, "messages"],
    queryFn: () => ticketsApi.getMessages(ticket.ticket.id),
    enabled: !!ticket.ticket.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => ticketsApi.sendMessage(ticket.ticket.id, messageData),
    onSuccess: () => {
      setMessage("");
      setIsInternal(false);
      queryClient.invalidateQueries({
        queryKey: ["/api/tickets", ticket.ticket.id, "messages"],
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: (updates: any) => ticketsApi.updateTicket(ticket.ticket.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tickets"],
      });
      toast({
        title: "Ticket atualizado",
        description: "O status do ticket foi atualizado com sucesso.",
      });
    },
  });

  useEffect(() => {
    if (ticket.ticket.id) {
      joinTicket(ticket.ticket.id);
    }
    return () => {
      leaveTicket();
    };
  }, [ticket.ticket.id, joinTicket, leaveTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message,
      type: "text",
      isInternal,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResult = await uploadApi.uploadFile(file);
      sendMessageMutation.mutate({
        content: uploadResult.filename,
        type: file.type.startsWith("image/") ? "image" : "document",
        mediaUrl: uploadResult.url,
        isInternal,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(ticket.ticket.id, true);
      setTimeout(() => {
        setIsTyping(false);
        sendTyping(ticket.ticket.id, false);
      }, 3000);
    }
  };

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

  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Selecione um ticket para ver a conversa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Ticket Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              {ticket.ticket.number}
            </h2>
            <Badge className={cn("text-xs", getStatusColor(ticket.ticket.status))}>
              {ticket.ticket.status === "open" ? "Aberto" :
               ticket.ticket.status === "in_progress" ? "Em Atendimento" :
               ticket.ticket.status === "pending_customer" ? "Pendente Cliente" :
               ticket.ticket.status === "resolved" ? "Resolvido" : "Fechado"}
            </Badge>
            <Badge className={cn("text-xs", getPriorityColor(ticket.ticket.priority))}>
              {ticket.ticket.priority === "high" ? "Alta Prioridade" :
               ticket.ticket.priority === "critical" ? "Crítica" :
               ticket.ticket.priority === "low" ? "Baixa" : "Normal"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" data-testid="transfer-ticket">
              <UserPlus className="w-4 h-4 mr-2" />
              Transferir
            </Button>
            <Button
              size="sm"
              onClick={() => updateTicketMutation.mutate({ status: "resolved" })}
              disabled={updateTicketMutation.isPending}
              data-testid="resolve-ticket"
            >
              <Check className="w-4 h-4 mr-2" />
              Resolver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Cliente:</span>
            <span className="ml-2 font-medium text-card-foreground">
              {ticket.customer?.name || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">WhatsApp:</span>
            <span className="ml-2 text-card-foreground">
              {ticket.contact?.whatsappNumber || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">SLA:</span>
            <span className="ml-2 text-orange-600">2h 15m restantes</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/30 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-card rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages?.map((msg: any, index: number) => (
            <div key={msg.id} className="mb-4">
              {msg.isInternal ? (
                <Card className="max-w-md bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <StickyNote className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        Nota Interna
                      </span>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">{msg.content}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </CardContent>
                </Card>
              ) : msg.direction === "in" ? (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-500 text-white text-sm">
                      {ticket.customer?.name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-card p-3 rounded-lg max-w-md border shadow-sm">
                      {msg.type === "image" && msg.mediaUrl && (
                        <img
                          src={msg.mediaUrl}
                          alt="Imagem enviada"
                          className="w-full max-w-xs rounded mb-2"
                        />
                      )}
                      <p className="text-sm text-card-foreground">{msg.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {ticket.customer?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      {msg.status === "read" && (
                        <Check className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1">
                    <div className="bg-green-600 text-white p-3 rounded-lg max-w-md ml-auto">
                      {msg.type === "image" && msg.mediaUrl && (
                        <img
                          src={msg.mediaUrl}
                          alt="Imagem enviada"
                          className="w-full max-w-xs rounded mb-2"
                        />
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 justify-end">
                      {msg.status === "read" && (
                        <Check className="w-3 h-3 text-green-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Você</span>
                    </div>
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      A
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Button
            variant={isInternal ? "secondary" : "default"}
            size="sm"
            onClick={() => setIsInternal(!isInternal)}
            data-testid="toggle-internal-note"
          >
            <StickyNote className="w-4 h-4 mr-2" />
            {isInternal ? "Nota Interna" : "Resposta Cliente"}
          </Button>
          <Button variant="outline" size="sm" data-testid="quick-response">
            Resposta Rápida
          </Button>
          <Button variant="outline" size="sm" data-testid="template-button">
            Template
          </Button>
        </div>

        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              placeholder={isInternal ? "Digite uma nota interna..." : "Digite sua mensagem..."}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              className="resize-none"
              rows={3}
              data-testid="message-input"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="attach-file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className={cn(
                isInternal 
                  ? "bg-amber-600 hover:bg-amber-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
              data-testid="send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        />
      </div>
    </div>
  );
}
