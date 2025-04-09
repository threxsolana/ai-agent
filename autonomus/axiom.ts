import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface TokenAnalytics {
  top10HoldersPercent: number;
  devHoldsPercent: number;
  snipersHoldPercent: number;
  insidersHoldPercent: number;
  bundlersHoldPercent: number;
  dexPaid: boolean;
  numHolders: number;
  numBotUsers: number;
  numBluechipHolders: number;
}

export const getTokenInfo = async (
  pairAddress: string
): Promise<TokenAnalytics> => {
  try {
    const response = await axios.get<TokenAnalytics>(
      `https://api5.axiom.trade/token-info?pairAddress=${pairAddress}`,
      {
        headers: {
          Accept: "application/json",
          Cookie: `auth-refresh-token=${process.env.AXIOM_AUTH_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(`Failed to get token info: ${error.message}`);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};
