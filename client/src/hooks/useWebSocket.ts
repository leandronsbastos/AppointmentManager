import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to the server. Some features may not work properly.",
        variant: "destructive",
      });
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [token, toast]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_ticket':
        toast({
          title: "New Ticket",
          description: `Ticket ${message.ticket.number} has been created`,
        });
        break;

      case 'new_message':
        toast({
          title: "New Message",
          description: `New message in ticket ${message.ticketId}`,
        });
        break;

      case 'ticket_update':
        // Handle ticket updates
        break;

      case 'typing':
        // Handle typing indicators
        break;

      default:
        console.log('Unhandled WebSocket message:', message);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const joinTicket = (ticketId: string) => {
    sendMessage({ type: 'join_ticket', ticketId });
  };

  const leaveTicket = () => {
    sendMessage({ type: 'leave_ticket' });
  };

  const sendTyping = (ticketId: string, isTyping: boolean) => {
    sendMessage({ type: 'typing', ticketId, isTyping });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    joinTicket,
    leaveTicket,
    sendTyping,
  };
}
