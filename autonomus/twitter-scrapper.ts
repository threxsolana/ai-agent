import dotenv from "dotenv";
import fs from "fs";
import { Scraper } from "agent-twitter-client";

dotenv.config();

const scraper = new Scraper();

const loadCookies = async () => {
  try {
    const cookies = [];

    await scraper.setCookies(cookies);

    console.log("✅ Cookies loaded successfully.");
    return true;
  } catch (error) {
    console.error("❌ Error loading cookies:", error);
    return false;
  }
};

const loginIfNeeded = async () => {
  if (await loadCookies()) {
    console.log("🔄 Using saved cookies...");
    return;
  }

  console.log("🔑 Logging in...");

  await scraper.login(
    process.env.TWITTER_USERNAME as string,
    process.env.TWITTER_PASSWORD as string,
    process.env.TWITTER_EMAIL as string,
    process.env.TWITTER_2FA_SECRET as string
  );

  const getCookie = scraper.getCookies();
  console.log(getCookie, "cookie");
};

export const postTweetWithMedia = async (content: string) => {
  try {
    await loginIfNeeded();
    const mediaData = [
      {
        data: fs.readFileSync("output.png"),
        mediaType: "image/jpeg",
      },
    ];

    await scraper.sendTweet(content, undefined, mediaData);

    console.log(`✅ Tweet posted from lib!`);
  } catch (error) {
    console.error("❌ Failed to post tweet:", error);
  }
};

export const postTweets = async (content: string) => {
  try {
    await loginIfNeeded();
    await scraper.sendTweet(content);

    console.log(`✅ Tweet posted: "${content} from lib"`);
  } catch (error) {
    console.error("❌ Failed to post tweet:", error);
  }
};

loginIfNeeded();
