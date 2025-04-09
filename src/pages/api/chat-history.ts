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

  const {userId} = req.query;

  if (!userId) {
    return res.status(400).json({error: "Missing userId parameter"});
  }

  if (!isValidPrivyID(userId as string)) {
    return res.status(400).json({
      error: "Invalid userId format. Expected format: did:privy:followed_by_alphanumeric",
    });
  }

  try {
    const {data: chats, error} = await supabase
      .from("chats")
      .select("id, messages, chat_name")
      .eq("user_id", userId)
      .order("created_at", {ascending: false});

    if (error) throw error;

    const response = {
      chats: chats.map((chat) => ({
        chatId: chat.id,
        messages: chat.messages,
        chatName: chat.chat_name,
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
