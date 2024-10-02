import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';

@WebSocketGateway({ cors: true })
export class ConversationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private messageService: MessageService) {}

  afterInit() {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, conversationId: number) {
    client.join(conversationId.toString()); // Join the room with conversationId as room name
    console.log(`Client ${client.id} joined room ${conversationId}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { senderId: number; conversationId: number; content: string },
  ) {
    // Save the message to the database using MessageService
    const message = await this.messageService.sendMessage(
      payload.senderId,
      payload.conversationId,
      payload.content,
    );

    // Broadcast the message to all clients in the conversation room
    this.server.to(payload.conversationId.toString()).emit('message', message); // Send the message to all clients in the room
  }
}
