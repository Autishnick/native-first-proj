import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/common/auth/decorators/user.decorator';
import { FirebaseAuthGuard } from 'src/common/auth/guards/firebase-auth.guard';
import { type UserProfile } from 'src/users/entities/user.entity';
import { ChatService } from './chat.service';

class FindOrCreateChatDto {
  taskId: string;
  recipientId: string;
  recipientName: string;
}

class SendMessageDto {
  text: string;
}

@UseGuards(FirebaseAuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('find-or-create')
  findOrCreate(
    @Body() findOrCreateChatDto: FindOrCreateChatDto,
    @User() user: UserProfile,
  ) {
    const { taskId, recipientId, recipientName } = findOrCreateChatDto;
    return this.chatService.findOrCreateChat(
      user,
      recipientId,
      recipientName,
      taskId,
    );
  }

  @Get()
  findAllForUser(@User() user: UserProfile) {
    return this.chatService.findAllChatsForUser(user.uid);
  }

  @Get(':chatId/messages')
  findAllMessages(@Param('chatId') chatId: string, @User() user: UserProfile) {
    return this.chatService.findAllMessagesForChat(chatId, user.uid);
  }

  @Post(':chatId/messages')
  sendMessage(
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: SendMessageDto,
    @User() user: UserProfile,
  ) {
    const { text } = sendMessageDto;
    return this.chatService.sendMessage(chatId, text, user.uid);
  }
}
