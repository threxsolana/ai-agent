import { fileURLToPath } from "url";
import { generateImage } from "./generate/metadata-coin";
import path from "path";

const sampleData = {
  totalLiquidityUsd: "500000",
  tokenLogo:
    "https://pump.mypinata.cloud/ipfs/QmdnAHMWTbxfRkwdf1QweP8rJL1SCe2XbjFTFzCCjw5oAD?img-width=256&img-dpr=2",
  tokenName: "DogePump",
  tokenSymbol: "DPUMP",
  currentMarketCap: 1200000,
  totalVolume: {
    "5min": 5000,
    "1h": 25000,
    "4h": 100000,
    "24h": 500000,
  },
  currentUsdPrice: "0.0023",
  deployed: 145552141335,
  buyers: {
    "5min": 10,
    "1h": 50,
    "4h": 200,
    "24h": 800,
  },
  sellers: {
    "5min": 5,
    "1h": 30,
    "4h": 150,
    "24h": 600,
  },
};

async function running() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const backgroundImage = path.join(__dirname, ".", "generate", "meta-bg.png");
  await generateImage(backgroundImage, sampleData);
}

running();
