import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FireStoreService } from 'src/common/database/firestore.service';
import { UserProfile } from 'src/users/entities/user.entity';

@Injectable()
export class ChatService {
  private readonly chatsCollection;
  private readonly usersCollection;
  private FieldValue;

  constructor(private readonly firebaseService: FireStoreService) {
    this.chatsCollection = this.firebaseService.firestore.collection('chats');
    this.usersCollection = this.firebaseService.firestore.collection('users');
    this.FieldValue = this.firebaseService.FieldValue;
  }

  async findOrCreateChat(
    currentUser: UserProfile,
    recipientId: string,
    recipientName: string,
    taskId: string,
  ) {
    const participantIds = [currentUser.uid, recipientId].sort();

    const query = this.chatsCollection
      .where('taskId', '==', taskId)
      .where('participants', '==', participantIds);

    const snapshot = await query.get();
    if (!snapshot.empty) {
      const existingChat = snapshot.docs[0];
      return { id: existingChat.id, ...existingChat.data() };
    }

    const newChatData = {
      taskId,
      participants: participantIds,
      participantDetails: [
        { uid: currentUser.uid, displayName: currentUser.displayName },
        { uid: recipientId, displayName: recipientName },
      ],
      createdAt: this.FieldValue.serverTimestamp(),
      lastMessage: null,
    };

    const chatRef = await this.chatsCollection.add(newChatData);
    return { id: chatRef.id, ...newChatData };
  }

  async findAllChatsForUser(userId: string) {
    const query = this.chatsCollection.where(
      'participants',
      'array-contains',
      userId,
    );
    const snapshot = await query.get();
    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const lastMessage = data.lastMessage
        ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt?.toDate
              ? data.lastMessage.createdAt.toDate().toISOString()
              : data.lastMessage.createdAt,
          }
        : null;

      return {
        id: doc.id,
        ...data,
        lastMessage: lastMessage,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      };
    });
  }

  async findAllMessagesForChat(chatId: string, userId: string) {
    const chatRef = this.chatsCollection.doc(chatId);
    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) throw new NotFoundException('Chat not found');

    const participants = chatDoc.data().participants;
    if (!participants.includes(userId)) {
      throw new UnauthorizedException('You are not a member of this chat');
    }

    const messagesQuery = chatRef
      .collection('messages')

      .orderBy('createdAt', 'desc');

    const snapshot = await messagesQuery.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      };
    });
  }

  async sendMessage(chatId: string, text: string, senderId: string) {
    const chatRef = this.chatsCollection.doc(chatId);

    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) throw new NotFoundException('Chat not found');
    const participants = chatDoc.data().participants;
    if (!participants.includes(senderId)) {
      throw new UnauthorizedException('You are not a member of this chat');
    }

    const newMessage = {
      senderId,
      text,
      createdAt: this.FieldValue.serverTimestamp(),
      type: 'MESSAGE',
    };

    const messageRef = await chatRef.collection('messages').add(newMessage);

    await chatRef.update({
      lastMessage: newMessage,
    });

    return {
      id: messageRef.id,
      ...newMessage,
      createdAt: new Date().toISOString(),
    };
  }
}
