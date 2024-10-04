import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { ConversationService } from './conversation.service';
import { Logger } from '@nestjs/common';

const CLIENT_ID_EVENT = 'client-id-event';
const OFFER_EVENT = 'offer-event';
const ANSWER_EVENT = 'answer-event';
const ICE_CANDIDATE_EVENT = 'ice-candidate-event';
@WebSocketGateway({ cors: true })
export class ConversationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('AppGateway');
  private clientList: any = {};
  private roomList: any = [];

  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
  ) {}

  afterInit() {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    delete this.clientList[client.id];
    for (let i = 0; i < this.roomList.length; i++) {
      if (
        this.roomList[i].host == client.id ||
        this.roomList[i].peer == client.id
      ) {
        this.roomList.splice(i, 1);
      }
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clientList[client.id] = client;
    // @nhancv 3/30/20: Send client id to client
    client.emit(CLIENT_ID_EVENT, client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    payload: { senderId: number; recipientId: number },
  ) {
    try {
      const conversation =
        await this.conversationService.getOrCreateConversation(
          payload.senderId,
          payload.recipientId,
        );

      // Ensure the conversation exists before joining the room
      if (!conversation || !conversation.id) {
        throw new Error('Failed to create or find a valid conversation');
      }

      // Join the room using the conversation ID as the room name
      client.join(`room-${conversation.id}`);
      console.log(`User ${payload.senderId} joined room-${conversation.id}`);
    } catch (error) {
      console.error('Error in handleJoinRoom:', error.message);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { senderId: number; recipientId: number; content: string },
  ) {
    // Save the message to the database using MessageService
    const message = await this.messageService.sendMessage(
      payload.senderId,
      payload.recipientId,
      payload.content,
    );

    const conversation = await this.conversationService.getOrCreateConversation(
      payload.senderId,
      payload.recipientId,
    );

    // Broadcast the message to the specific room
    this.server.to(`room-${conversation.id}`).emit('message', message);
  }

  @SubscribeMessage('video-chat')
  async handleVideoChat(
    client: Socket,
    payload: { senderId: number; recipientId: number; type: string },
  ) {
    const conversation = await this.conversationService.getOrCreateConversation(
      payload.senderId,
      payload.recipientId,
    );

    // Broadcast the video chat event to the specific room
    this.server.to(`room-${conversation.id}`).emit('video-chat', payload);
  }

  findPeerId(hostId: string) {
    for (let i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].host == hostId) {
        return this.roomList[i].peer;
      }
    }
  }

  findHostId(peerId: string) {
    for (let i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].peer == peerId) {
        return this.roomList[i].host;
      }
    }
  }

  @SubscribeMessage(OFFER_EVENT)
  async onOfferEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { peerId: string; description: any },
  ): Promise<number> {
    console.log(data);
    // @nhancv 3/30/20: Create a room contain client id with peerId;
    this.roomList.push({ host: client.id, peer: data.peerId });

    const peer = this.clientList[data.peerId];
    if (peer) {
      peer.emit(OFFER_EVENT, data.description);
    } else {
      console.log('onOfferEvent: Peer does not found');
    }
    return 0;
  }

  @SubscribeMessage(ANSWER_EVENT)
  async onAnswerEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { description: any },
  ): Promise<number> {
    console.log(data);
    const hostId = this.findHostId(client.id);
    const host = this.clientList[hostId];
    if (host) {
      host.emit(ANSWER_EVENT, data.description);
    } else {
      console.log('onAnswerEvent: Host does not found');
    }
    return 0;
  }

  @SubscribeMessage(ICE_CANDIDATE_EVENT)
  async onIceCandidateEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { isHost: boolean; candidate: any },
  ): Promise<number> {
    console.log(data);
    let clientId;
    if (data.isHost) {
      clientId = this.findPeerId(client.id);
    } else {
      clientId = this.findHostId(client.id);
    }
    const peer = this.clientList[clientId];
    if (peer) {
      peer.emit(ICE_CANDIDATE_EVENT, data.candidate);
    } else {
      console.log('onIceCandidateEvent: Peer does not found');
    }
    return 0;
  }
}
