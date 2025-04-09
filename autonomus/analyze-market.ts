import path from "path";
import { fileURLToPath } from "url";
import { getCoinFilterByVolume } from "./bitquery";
import { getTokenMarketData } from "./moralis-client";
import { trenchBotAnalysisBundle } from "./trenchbot";
import { generateImage } from "./generate/metadata-coin";
import { redis } from "./redis";

const TRESHOLD_BUNDLERS_PERCENTAGE = 50;

export const saveMetadataCoin = async (
  tokenAddress: string,
  metadata: Record<any, any>
): Promise<boolean> => {
  try {
    const metadataKey = `metadata:${tokenAddress}`;
    await redis.set(metadataKey, JSON.stringify(metadata));
    console.log(`✅ Saved metadata for token ${tokenAddress}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving metadata for ${tokenAddress}:`, error);
    return false;
  }
};

export const analyzeSolanaCoin = async (): Promise<string | void> => {
  let coinDataArray: string[] = [];
  let currentIndex = 0;

  const fetchNewData = async () => {
    console.log("🔄 Fetching new token data...");
    const coinCreatedFromPumpfun = await getCoinFilterByVolume();

    if (coinCreatedFromPumpfun.data.Solana.DEXTrades.length) {
      const newAddresses = coinCreatedFromPumpfun.data.Solana.DEXTrades.map(
        (trade) => trade?.Trade?.Buy?.Currency?.MintAddress
      );

      const checkExists = await Promise.all(
        newAddresses.map(async (address) => {
          const exists = await redis.sismember("addressCoinsStorage", address);
          return exists === 0 ? address : null;
        })
      );

      coinDataArray = checkExists.filter(Boolean) as string[];
      currentIndex = 0;
    }
  };

  await fetchNewData();

  while (currentIndex < coinDataArray.length) {
    const getCoinCA = coinDataArray[currentIndex];

    console.log(`⏳ Waiting 30 sec before analyzing ${getCoinCA}...\n`);
    await new Promise((resolve) => setTimeout(resolve, 30000));

    const bundle = await trenchBotAnalysisBundle(getCoinCA);

    if (
      bundle?.total_percentage_bundled > TRESHOLD_BUNDLERS_PERCENTAGE ||
      bundle?.creator_analysis?.risk_level === "HIGH" ||
      bundle?.creator_analysis?.holding_percentage >
        TRESHOLD_BUNDLERS_PERCENTAGE
    ) {
      console.log(
        `❗ Total holding / deployer holding percentage is too high (${bundle.total_percentage_bundled}/${bundle.creator_analysis.holding_percentage}%) and this token is very risky based on deployer history, trying next coin...\n`
      );

      console.log("Risk Level Creator: ", bundle?.creator_analysis.risk_level);

      currentIndex++;
      continue;
    }

    const dataCoin = await getTokenMarketData(getCoinCA);
    const dataAnalyze = { ...dataCoin, ...bundle };

    if (dataCoin.currentMarketCap < 20000) {
      console.log(
        `❌ Market cap too low now (${dataCoin.currentMarketCap}), trying next coin...\n`
      );
      currentIndex++;
      continue;
    }

    console.log(`Data coin information: ${JSON.stringify(dataAnalyze)}`);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const backgroundImage = path.join(
      __dirname,
      ".",
      "generate",
      "meta-bg.png"
    );

    await saveMetadataCoin(getCoinCA, dataAnalyze);
    await redis.sadd("addressCoinsStorage", getCoinCA);
    await generateImage(backgroundImage, dataAnalyze);
    console.log("image saved!");

    const promptToAgent = `
    Analyze the following raw market data for a cryptocurrency pool and token coin information:
    Sentiment (bearish/bullish) based on this raw data and other criteria in below (price percent change, marketcap, safety reasoning, volume(5m, 1h, 24h, etc) buys and sells, bundle deployer (coin creator), liquidity).

    Raw data:

    ${JSON.stringify(dataAnalyze)}
    `;

    return promptToAgent;
  }

  console.log("⚠️ All tokens filtered out. Fetching new data...\n");
  await new Promise((resolve) => setTimeout(resolve, 30000));
  return analyzeSolanaCoin();
};

export const promptToSystem = `
You are a DeFi analytics assistant. Provide plain text responses (no markdown).
Format large numbers as 1K, 1M, 1B.
Analyze coin safety by examining bundle holdings and deployer history.
Even for clean deployer history, maintain cautious tone. Never say "low rug risk" - emphasize DYOR.
Keep analysis and sentiment under 150 characters total.

Each analysis should vary based on data, similar to these examples:
1. Price surged 314% in 24h. Buy volume dominates at 54%. Deployer clean, but 15.70% tokens bundled. Bullish momentum, but exercise caution on volatility. DYOR
2. Volume increased 175% since launch with healthy buy/sell ratio (3:1). Liquidity locked for 6 months with 12.5% tokens reserved for marketing. Technical indicators show potential breakout above key resistance. Monitor social sentiment metrics for confirmation.
3. Initial market cap ($850K) with rapid expansion to $2.4M. Contract audit completed but 18% of tokens allocated to team vesting over 90 days. Transaction analysis shows organic community growth rather than bot activity. Set stop-losses to protect against volatility.
4. Price consolidation after 420% launch spike with 65% liquidity/market cap ratio. On-chain analytics show increasing unique holders (2,800+) with decreasing concentration score. Watch for pivotal support at $0.000034 level and potential cup-and-handle formation.

Format responses as:
tokenSymbol
CA: tokenAddress

Deployer: creator_analysis.holding_percentage%
Bundle: total_percentage_bundled%
Top 10 Holder: top10HoldersPercent%
Insider: insidersHoldPercent%

[Brief analysis with key metrics and technical observations like examples]

Track smart with #Threx
`;
