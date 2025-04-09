import {usePrivy} from "@privy-io/react-auth";
import {useQueryClient} from "@tanstack/react-query";
import {useSetAtom} from "jotai";
import {Send} from "lucide-react";
import {useState, useRef, useEffect} from "react";
import {useSendChat} from "~/hooks/useChat";
import {chatAtom, isAgentThinkingAtom, isAgentWritingResponseAtom} from "~/state/chat";
import {useRouter} from "next/router";
import {useQueryState} from "next-usequerystate";

export const ChatBox = () => {
  const {authenticated, login} = usePrivy();
  const {query} = useRouter();

  const [chatId, setChatId] = useQueryState("id");
  const [type, setType] = useQueryState("type");
  const [message, setMessage] = useState("");

  const setMessages = useSetAtom(chatAtom);
  const setIsAgentThinking = useSetAtom(isAgentThinkingAtom);
  const setIsAgentWritingResponse = useSetAtom(isAgentWritingResponseAtom);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const sendChat = useSendChat();
  const qc = useQueryClient();

  useEffect(() => {
    if (query.id) {
      setChatId(query.id as string);
    }
    if (query.type) {
      setType(query.type as string);
    }
  }, [query.id, query.type]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const onStartChat = () => {
    if (!authenticated) return login();

    setIsAgentThinking(true);
    setMessage("");
    setMessages((prev) => {
      return [...(prev as Message[]), {content: message, role: "user"}];
    });

    sendChat.mutateAsync(
      {
        userMessage: message,
        chatId: type === "new-chat" ? undefined : (chatId as string),
      },
      {
        onSuccess: (data) => {
          setIsAgentThinking(false);
          setIsAgentWritingResponse(true);
          qc.invalidateQueries({queryKey: ["get-chats"]});

          if (type === "new-chat") {
            setType("current-chat");
            setChatId(data.chatId);
            return;
          }

          return setMessages((prev) => {
            return [
              ...(prev as Message[]),
              {content: data.assistantMessage.content, role: "assistant"},
            ];
          });
        },
      },
    );
  };

  return (
    <div className="flex w-full max-w-3xl items-start justify-center rounded-xl border border-white/10 bg-[#EAEAEA] p-3">
      <textarea
        ref={textAreaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message"
        className="flex-1 resize-none overflow-y-auto rounded-lg bg-[#fff] px-4 py-2 text-black placeholder-gray-500 outline-none"
        rows={1}
        style={{minHeight: "40px"}}
      />
      <button disabled={!message} className="p-2 text-black" onClick={onStartChat}>
        <Send size={20} />
      </button>
    </div>
  );
};
