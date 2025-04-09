import {NextApiRequest, NextApiResponse} from "next";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

function isValidPrivyID(id: string) {
  const privyRegex = /^did:privy:[a-zA-Z0-9]+$/;
  return privyRegex.test(id);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
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
    // First verify that the chat belongs to the user
    const {error: fetchError} = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({
          error: "Chat not found or doesn't belong to this user",
        });
      }
      throw fetchError;
    }

    const {error: deleteError} = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
      chatId,
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
