import axios from "axios";
import {NextApiRequest, NextApiResponse} from "next";

export const getTokenInfo = async (pairAddress: string): Promise<TokenAnalytics> => {
  const API_URL = process.env.AXIOM_API;

  try {
    const {data} = await axios.get<TokenAnalytics>(
      `${API_URL}/token-info?pairAddress=${pairAddress}`,
      {
        headers: {
          Accept: "application/json",
          Cookie: `auth-refresh-token=${process.env.AXIOM_AUTH_TOKEN}`,
        },
      },
    );

    return data;
  } catch (error) {
    console.error("Axiom API error:", error);
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenAnalytics | {error: string; details?: any}>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({error: "Method Not Allowed"});
  }

  const {address} = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({error: "Invalid or missing address parameter"});
  }

  try {
    const tokenInfo = await getTokenInfo(address);
    res.status(200).json(tokenInfo);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return res.status(error.response.status).json({
          error: "API Error",
          details: error.response.data,
        });
      } else if (error.request) {
        return res.status(503).json({
          error: "Service unavailable",
          details: "No response received from API",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
