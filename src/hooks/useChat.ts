import {usePrivy} from "@privy-io/react-auth";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {useRouter} from "next/router";
import axios from "axios";
import {useQueryState} from "next-usequerystate";

type SendChatResponse = {
  chatId: string;
  assistantMessage: {
    role: "assistant";
    content: string;
  };
};

type SendChatVariables = {
  userId: string;
  chatId?: string;
  userMessage: string;
};

type DeleteChatResponse = {
  success: boolean;
  message: string;
  chatId: string;
};

type DeleteChatVariables = {
  chatId: string;
};

export const useGetChatHistory = () => {
  const {user} = usePrivy();
  const userId = user?.id;

  return useQuery<ChatListHistory, Error>({
    queryKey: ["get-chats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await axios.get(`/api/chat-history?userId=${userId}`);
      return res.data;
    },
  });
};

export const useGetChatDetail = () => {
  const {user} = usePrivy();
  const [chatId] = useQueryState("id");

  const userId = user?.id;

  return useQuery<ChatHistoryDetail, Error>({
    queryKey: ["get-chat-detail", chatId],
    enabled: !!userId && !!chatId,
    queryFn: async () => {
      const res = await axios.get(
        `/api/chat/detail?userId=${userId}&chatId=${chatId?.split("?")[0]}`,
      );
      return res.data;
    },
  });
};

const sendChat = async ({
  userId,
  userMessage,
  chatId,
}: SendChatVariables): Promise<SendChatResponse> => {
  const getChatId = chatId ? chatId?.split("?")[0] : undefined;

  const response = await axios.post("/api/chat", {
    userId,
    userMessage,
    chatId: getChatId,
  });

  return response.data;
};

export const useSendChat = (): UseMutationResult<
  SendChatResponse,
  Error,
  Omit<SendChatVariables, "userId">
> => {
  const {user} = usePrivy();

  return useMutation<SendChatResponse, Error, Omit<SendChatVariables, "userId">>({
    mutationFn: (params) => sendChat({...params, userId: user?.id as string}),
  });
};

const deleteChat = async ({
  userId,
  chatId,
}: DeleteChatVariables & {userId: string}): Promise<DeleteChatResponse> => {
  const response = await axios.delete(
    `/api/delete-chat?userId=${userId}&chatId=${chatId}`,
  );
  return response.data;
};

export const useDeleteChat = (): UseMutationResult<
  DeleteChatResponse,
  Error,
  DeleteChatVariables
> => {
  const {user} = usePrivy();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<DeleteChatResponse, Error, DeleteChatVariables>({
    mutationFn: (params) => deleteChat({...params, userId: user?.id as string}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["get-chats", user?.id]});

      router.push("/chat");
    },
  });
};
