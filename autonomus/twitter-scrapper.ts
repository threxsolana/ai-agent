import dotenv from "dotenv";
import fs from "fs";
import { Scraper } from "agent-twitter-client";

dotenv.config();

const scraper = new Scraper();

const loadCookies = async () => {
  try {
    const cookies = [
      "guest_id_marketing=v1%3A174119225397332947; Expires=Fri, 05 Mar 2027 16:30:53 GMT; Max-Age=63072000; Domain=twitter.com; Path=/; Secure; hostOnly=false; aAge=1ms; cAge=1699ms",
      "guest_id_ads=v1%3A174119225397332947; Expires=Fri, 05 Mar 2027 16:30:53 GMT; Max-Age=63072000; Domain=twitter.com; Path=/; Secure; hostOnly=false; aAge=4ms; cAge=1701ms",
      'personalization_id="v1_P79a/ujcvT1m21t0W0HEEA=="; Expires=Fri, 05 Mar 2027 16:30:53 GMT; Max-Age=63072000; Domain=twitter.com; Path=/; Secure; hostOnly=false; aAge=4ms; cAge=1701ms',
      "guest_id=v1%3A174119225397332947; Expires=Fri, 05 Mar 2027 16:30:53 GMT; Max-Age=63072000; Domain=twitter.com; Path=/; Secure; hostOnly=false; aAge=4ms; cAge=1701ms",
      "kdt=ezOIxSPuAzjvWjdkZzPNHu9U6KxcYwZVQCSCDKo5; Expires=Thu, 03 Sep 2026 16:30:55 GMT; Max-Age=47260800; Domain=twitter.com; Path=/; Secure; HttpOnly; hostOnly=false; aAge=4ms; cAge=230ms",
      'twid="u=1884510141401423876"; Expires=Mon, 04 Mar 2030 16:30:55 GMT; Max-Age=157680000; Domain=twitter.com; Path=/; Secure; hostOnly=false; aAge=4ms; cAge=229ms',
      "ct0=6e4b30ee7138a13459b5b3af54c271b3f98324e380ca09eef30115ffc5ae20ff4b9a77e241dfbb26428233e2cdbefe4fe822460aab2fa032362cab8493b425248468c4dc9786e43b261f0451856e5803; Expires=Mon, 04 Mar 2030 16:30:55 GMT; Max-Age=157680000; Domain=twitter.com; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=4ms; cAge=229ms",
      "auth_token=87131f3e876336e935f039746ba26a02802bcda9; Expires=Mon, 04 Mar 2030 16:30:55 GMT; Max-Age=157680000; Domain=twitter.com; Path=/; Secure; HttpOnly; hostOnly=false; aAge=4ms; cAge=229ms",
      "att=1-rxfy9gNvPoh0scATsx9N6bZAdGgxs0lKKYkhqpde; Expires=Thu, 06 Mar 2025 16:30:55 GMT; Max-Age=86400; Domain=twitter.com; Path=/; Secure; HttpOnly; hostOnly=false; aAge=4ms; cAge=5ms",
    ];

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
