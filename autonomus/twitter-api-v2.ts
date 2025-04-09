import { TwitterApi } from "twitter-api-v2";

import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export const postTweetWithMediaV1 = async (content: string) => {
  const imageBuffer = fs.readFileSync("output.png");
  const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
    mimeType: "image/png",
  });

  console.log("Image uploaded to Twitter, media ID:", mediaId);
  await twitterClient.v2.tweet(content, {
    media: { media_ids: [mediaId] },
  });
};
