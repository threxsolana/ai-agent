import { analyzeSolanaCoin, promptToSystem } from "./analyze-market";
import { redis } from "./redis";
import { postTweetWithMediaV1 } from "./twitter-api-v2";
import dotenv from "dotenv";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

dotenv.config();

console.log("\n===== AI Agent is Running =====\n");

const otherConfig = {
  temperature: 0.3,
  top_p: 0.8,
  max_tokens: 500,
};

const maxPostsPerDay = 100;
const maxPosts = 5;
const intervalMinutes = 3;
const retryAfterMinutes = 50;
let count = 0;

// Key for storing posted token addresses in Redis
const POSTED_TOKENS_KEY = "postedTokenAddresses";

const getPostCount = async () => {
  const storedCoins = await redis.smembers("addressCoinsStorage");
  return storedCoins.length;
};

const isTokenAlreadyPosted = async (content: string) => {
  // Extract the token address from the content
  const addressMatch = content.match(/CA: ([a-zA-Z0-9]+)/);
  if (!addressMatch || !addressMatch[1]) return false;

  const tokenAddress = addressMatch[1];

  // Check if this token is in our posted tokens set
  const isPosted = await redis.sismember(POSTED_TOKENS_KEY, tokenAddress);

  console.log("Found the token", tokenAddress);

  return !!isPosted;
};

const markTokenAsPosted = async (content: string) => {
  const addressMatch = content.match(/CA: ([a-zA-Z0-9]+)/);
  if (!addressMatch || !addressMatch[1]) return;

  const tokenAddress = addressMatch[1];
  await redis.sadd(POSTED_TOKENS_KEY, tokenAddress);

  // Set an expiry on this set - 24 hours to reset daily
  await redis.expire(POSTED_TOKENS_KEY, 24 * 60 * 60);

  console.log("Mark token as a posted", tokenAddress);
};

const postToTwitter = async (content: string) => {
  const postCount = await getPostCount();

  const alreadyPosted = await isTokenAlreadyPosted(content);
  if (alreadyPosted) {
    console.log("🔄 Token already posted. Skipping to prevent duplicate post.");
    return;
  }

  try {
    await postTweetWithMediaV1(content);
    await markTokenAsPosted(content);

    console.log(
      `✅ Tweet posted successfully. Total posts today: ${
        postCount + 1
      }. Wait for ${intervalMinutes} minutes for the next post.`
    );

    count++;
    console.log(`📢 Current count in 30-minute window: ${count}`);

    // Add 2-minute wait after successful posting
    console.log("⏳ Waiting for 2 minutes after successful post...");
    await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
    console.log("✅ 2-minute wait completed. Ready for next action.");
  } catch (error) {
    console.error("❌ Failed to post tweet:", error);
  }
};

const runAnalysisAndPost = async () => {
  const postCount = await getPostCount();

  if (postCount >= maxPostsPerDay) {
    console.log("🚫 Max daily posts reached. Stopping execution.");
    await redis.flushall();
    process.exit(0);
  }

  console.log(`⏳ Running market analysis... (Post ${postCount + 1})`);
  const analysisResult = await analyzeSolanaCoin();

  if (typeof analysisResult === "string") {
    const messages: any[] = [
      { role: "system", content: promptToSystem },
      { role: "user", content: analysisResult },
    ];

    try {
      // Generate content with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        stream: false,
        temperature: otherConfig.temperature,
        top_p: otherConfig.top_p,
        max_tokens: otherConfig.max_tokens,
      });

      const aiResponse = completion.choices[0].message.content;

      if (aiResponse) {
        await postToTwitter(aiResponse);
      }
    } catch (error) {
      console.error("❌ AI generation error:", error);
    }
  }
};

const startScheduler = async () => {
  console.log(`⏳ Scheduler started: Running every ${intervalMinutes} minutes`);
  runAnalysisAndPost();

  const intervalId = setInterval(async () => {
    if (count >= maxPosts) {
      console.log(
        `✅ Max tweets reached (${maxPosts}) in 30 minutes. Pausing for ${retryAfterMinutes} minutes...`
      );
      count = 0;
      clearInterval(intervalId);

      setTimeout(startScheduler, retryAfterMinutes * 60 * 1000);
      return;
    }

    runAnalysisAndPost();
  }, intervalMinutes * 60 * 1000);
};

startScheduler();
