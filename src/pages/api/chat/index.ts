import {NextApiRequest, NextApiResponse} from "next";
import {generateText, ToolSet} from "ai";
import {openai} from "@ai-sdk/openai";
import {z} from "zod";
import {PostgrestError, createClient} from "@supabase/supabase-js";
import {aiAgentPrompt} from "~/lib/prompt";

type SolanaAnalysisResult = {
  trenchbot: TrenchBotResponse;
  dataToken: TokenAnalytics;
};

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

const analyzeSolanaSchema = z.object({
  address: z.string().describe("A valid Solana contract address"),
});

const tools: ToolSet = {
  analyzeSolanaAddress: {
    description: "Fetch and analyze blockchain data for a given Solana contract address.",
    parameters: analyzeSolanaSchema,
    execute: async ({
      address,
    }: z.infer<typeof analyzeSolanaSchema>): Promise<SolanaAnalysisResult> => {
      try {
        console.log(`Fetching analysis for address: ${address}`);

        const getBondedAddressRes = await fetch(
          `${process.env.API_URL}/api/pumpfun/${address}`,
        );

        if (!getBondedAddressRes.ok) {
          throw new Error(`Failed to fetch bonding curve address for ${address}`);
        }

        const getBondedAddress: GetMetadataResponse = await getBondedAddressRes.json();

        const [trenchbotRes, axiomRes] = await Promise.all([
          fetch(`${process.env.API_URL}/api/trenchbot/${address}`).then((res) =>
            res.json(),
          ),
          fetch(`${process.env.API_URL}/api/axiom/${getBondedAddress.bondingCurve}`).then(
            (res) => res.json(),
          ),
        ]);

        const result = {
          trenchbot: trenchbotRes,
          dataToken: axiomRes,
        };

        return result;
      } catch (error) {
        console.error("Error fetching Solana data:", error);
        throw new Error("Failed to fetch blockchain data.");
      }
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  const {userId, userMessage, chatId: queryChatId} = req.body;

  if (!userId || !userMessage) {
    return res.status(400).json({error: "Missing userId or userMessage"});
  }

  try {
    let messages = [];
    let chatId = queryChatId;

    if (queryChatId) {
      const {data: existingChat, error: fetchError} = await supabase
        .from("chats")
        .select("id, messages")
        .eq("id", queryChatId)
        .single();

      if (fetchError) throw fetchError;

      if (existingChat) {
        messages = existingChat.messages || [];
      } else {
        chatId = undefined;
      }
    }

    messages.push({role: "user" as const, content: userMessage});

    const {text, toolCalls} = await generateText({
      model: openai("gpt-4o-mini"),
      system: aiAgentPrompt,
      messages,
      tools,
    });

    let finalResponse = text;
    let addressAnalyzed = false;

    if (toolCalls && toolCalls.length > 0) {
      const toolResults = await Promise.all(
        toolCalls.map(async (call) => {
          if (
            call.type === "tool-call" &&
            call.toolName === "analyzeSolanaAddress" &&
            tools[call.toolName]
          ) {
            addressAnalyzed = true;
            const tool = tools[call.toolName] as unknown as {
              execute: (args: any) => Promise<SolanaAnalysisResult>;
            };
            return await tool.execute(call.args);
          }
          return null;
        }),
      );

      const validResults = toolResults.filter(
        (result): result is SolanaAnalysisResult => result !== null,
      );

      if (validResults.length > 0) {
        const sanitizeResults = validResults[0];

        const actualResults = {
          isCanAnalyze: true,
          trenchbot: sanitizeResults?.trenchbot,
          topTenHoldersPercentage: sanitizeResults.dataToken.top10HoldersPercent,
          totalHolder: sanitizeResults.dataToken.numHolders,
        };

        console.log(actualResults, "Result from Agent");

        const analysisMessages = [
          ...messages,
          {
            role: "system" as const,
            content: `Analysis for this data: ${JSON.stringify(actualResults)}`,
          },
        ];

        const {text: finalText} = await generateText({
          model: openai("gpt-4o-mini"),
          system: aiAgentPrompt,
          messages: analysisMessages,
        });

        finalResponse = finalText;
      }
    }

    messages.push({role: "assistant" as const, content: finalResponse});

    let insertOrUpdateError: PostgrestError | null;

    if (chatId) {
      const {error: updateError} = await supabase
        .from("chats")
        .update({messages})
        .eq("id", chatId);
      insertOrUpdateError = updateError;
    } else {
      const {data: insertData, error: insertError} = await supabase
        .from("chats")
        .insert([{user_id: userId, messages, chat_name: userMessage.slice(0, 20)}])
        .select("id")
        .single();

      insertOrUpdateError = insertError;

      if (insertData) {
        chatId = insertData.id;
      }
    }

    if (insertOrUpdateError) throw insertOrUpdateError;

    if (addressAnalyzed) {
      console.log(` - Address analyzed successfully.`);
    }

    return res
      .status(200)
      .json({assistantMessage: messages[messages.length - 1], chatId});
  } catch (error) {
    console.error("Error processing chat:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
