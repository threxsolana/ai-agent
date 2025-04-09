import React, {PropsWithChildren, useState} from "react";
import {
  Trash2,
  User,
  LogOut,
  LayoutDashboard,
  LogIn,
  MessageCircle,
  Menu,
  X,
  Edit,
} from "lucide-react";
import {Button} from "~/components/ui";
import {usePrivy} from "@privy-io/react-auth";
import {cn} from "~/lib/utils";
import {outfit} from "~/lib/fonts";
import {useRouter} from "next/router";
import {ChatHistory} from "./chat-history";
import {chatAtom} from "~/state/chat";
import {useSetAtom} from "jotai";
import {useDeleteChat} from "~/hooks/useChat";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  const {authenticated, logout, ready, login, user} = usePrivy();
  const {push, replace, query} = useRouter();

  const setMessages = useSetAtom(chatAtom);
  const deleteChat = useDeleteChat();
  const isCurrentChat = query.type === "current-chat";
  const chatId = query.id as string;

  const onNavigateToNewChat = () => {
    if (authenticated) {
      return replace(`/chat?id=${self.crypto.randomUUID()}&type=new-chat`);
    }

    return login();
  };

  const onLogout = () => {
    logout();
    setMessages(null);
    push("/chat");
  };

  return (
    <aside
      className={cn(
        "flex h-screen w-full flex-col overflow-auto border-r border-white/10 bg-[#1C1C1C] p-4 text-white ipad-mini:w-[350px]",
        outfit.className,
      )}>
      <Button
        onClick={onNavigateToNewChat}
        className="mb-7 w-full bg-[#FF4D00] text-base text-black hover:bg-white">
        + New chat
      </Button>

      <nav className="flex-1">
        <ul className="space-y-1">
          <Link href="https://threx.fun" target="_blank">
            <li className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 pb-2 pt-2.5 hover:bg-[#FF4D00] hover:text-black">
              <LayoutDashboard size={20} /> Home
            </li>
          </Link>
          {authenticated && (
            <li className="p-2.5">
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} />
                <p>Recent Chats</p>
              </div>
              <div className="mt-5">
                <ChatHistory />
              </div>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-4 border-t border-gray-700 pt-4">
        <ul className="space-y-1">
          {!!user && (
            <>
              {isCurrentChat && (
                <li
                  onClick={() => deleteChat.mutate({chatId})}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 hover:bg-[#FF4D00] hover:text-black">
                  <Trash2 size={20} /> Delete conversations
                </li>
              )}
              <li className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 hover:bg-[#FF4D00] hover:text-black">
                <User size={20} /> My account
              </li>
              <li
                className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 text-red-400 hover:bg-[#FF4D00] hover:text-black"
                onClick={onLogout}>
                <LogOut size={20} /> Log out
              </li>
            </>
          )}

          {ready && !authenticated && (
            <li
              className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 text-[#FF4D00] hover:bg-[#FF4D00] hover:text-black"
              onClick={login}>
              <LogIn size={20} /> Log in
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export const Layout = ({children}: PropsWithChildren) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {authenticated, login} = usePrivy();
  const {replace} = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const onNavigateToNewChat = () => {
    if (authenticated) {
      return replace(`/chat?id=${self.crypto.randomUUID()}&type=new-chat`);
    }

    return login();
  };

  return (
    <div className={cn("relative flex h-screen w-full", outfit.className)}>
      <div className="hidden nesthub:hidden laptop-sm:block">
        <Sidebar />
      </div>

      <div className="fixed z-50 h-[68px] w-full max-w-full bg-[#191919] px-5 py-3 nesthub:block laptop-sm:hidden">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              isSidebarOpen ? "right-5" : "left-5",
              "top-4 scale-90 rounded-md bg-[#FF4D00] px-2 text-black hover:bg-white",
            )}>
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <button
            disabled
            aria-label="Button get full access"
            type="button"
            className="flex items-center justify-center space-x-2 rounded-md bg-[#FF4D00] p-2 px-4">
            <Image src="/img/logo-black.png" width={20} height={20} alt="logo" />
            <p className="text-sm text-black">Get Full Access</p>
          </button>

          <button type="button" onClick={onNavigateToNewChat}>
            <Edit size={20} color="white" />
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed z-40 h-full w-4/5 nesthub:block laptop-sm:hidden">
          <Sidebar />
        </div>
      )}

      <main className={cn("flex-1 overflow-hidden p-1", outfit.className)}>
        {children}
      </main>
    </div>
  );
};
