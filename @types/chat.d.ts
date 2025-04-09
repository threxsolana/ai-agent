type Message = {
  role: string;
  content: string;
};

type Chat = {
  chatId: string;
  messages: Array<Message>;
  chatName?: string;
};

type ChatHistoryDetail = {
  messages: Array<Message>;
  chatId: string;
};

type ChatListHistory = {
  chats: Chat[];
};
