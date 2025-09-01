import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  role?: string;
  ticketId?: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    verifyClient: (info: any) => {
      try {
        const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
        const token = url.searchParams.get('token');
        
        if (!token) {
          return false;
        }

        jwt.verify(token, JWT_SECRET, (err, user: any) => {
          if (err) return false;
          (info.req as any).user = user;
        });

        return true;
      } catch {
        return false;
      }
    }
  });

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    const user = (req as any).user;
    ws.userId = user.userId;
    ws.role = user.role;

    console.log(`WebSocket connection established for user ${ws.userId}`);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleWebSocketMessage(ws, data, wss);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed for user ${ws.userId}`);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      userId: ws.userId
    }));
  });

  return wss;
}

function handleWebSocketMessage(ws: AuthenticatedWebSocket, data: any, wss: WebSocketServer) {
  switch (data.type) {
    case 'join_ticket':
      // Join a specific ticket room for real-time updates
      ws.ticketId = data.ticketId;
      break;

    case 'leave_ticket':
      // Leave ticket room
      delete ws.ticketId;
      break;

    case 'typing':
      // Broadcast typing indicator to other users in the same ticket
      broadcastToTicket(wss, data.ticketId, {
        type: 'typing',
        userId: ws.userId,
        ticketId: data.ticketId,
        isTyping: data.isTyping
      }, ws.userId);
      break;

    default:
      console.log('Unknown WebSocket message type:', data.type);
  }
}

export function broadcastToTicket(wss: WebSocketServer, ticketId: string, message: any, excludeUserId?: string) {
  wss.clients.forEach((client: AuthenticatedWebSocket) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.ticketId === ticketId &&
      client.userId !== excludeUserId
    ) {
      client.send(JSON.stringify(message));
    }
  });
}

export function broadcastToRole(wss: WebSocketServer, role: string, message: any) {
  wss.clients.forEach((client: AuthenticatedWebSocket) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.role === role
    ) {
      client.send(JSON.stringify(message));
    }
  });
}

export function notifyNewTicket(wss: WebSocketServer, ticket: any) {
  broadcastToRole(wss, 'agent', {
    type: 'new_ticket',
    ticket
  });

  broadcastToRole(wss, 'manager', {
    type: 'new_ticket',
    ticket
  });
}

export function notifyTicketUpdate(wss: WebSocketServer, ticketId: string, update: any) {
  broadcastToTicket(wss, ticketId, {
    type: 'ticket_update',
    ticketId,
    update
  });
}

export function notifyNewMessage(wss: WebSocketServer, ticketId: string, message: any) {
  broadcastToTicket(wss, ticketId, {
    type: 'new_message',
    ticketId,
    message
  });
}
