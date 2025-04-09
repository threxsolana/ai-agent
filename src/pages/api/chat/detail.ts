import {NextApiRequest, NextApiResponse} from "next";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

function isValidPrivyID(id: string) {
  const privyRegex = /^did:privy:[a-zA-Z0-9]+$/;
  return privyRegex.test(id);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({error: "Method not allowed"});
  }

  const {userId, chatId} = req.query;

  if (!userId || !chatId) {
    return res
      .status(400)
      .json({error: "Missing required parameters: userId and chatId"});
  }

  if (!isValidPrivyID(userId as string)) {
    return res.status(400).json({
      error: "Invalid userId format. Expected format: did:privy:followed_by_alphanumeric",
    });
  }

  try {
    const {data: chat, error} = await supabase
      .from("chats")
      .select("id, messages, created_at")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(200).json({
          chatId: chatId as string,
          messages: [],
          message: "Chat not found",
        });
      }
      throw error;
    }

    const response = {
      chatId: chat.id,
      messages: chat.messages,
      createdAt: chat.created_at,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching chat details:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
