import axios from "axios";
import {NextApiRequest, NextApiResponse} from "next";
import {transformToCamelCase} from "transform-obj";

export const trenchBotAnalysisBundle = async (
  address: string,
): Promise<TrenchBotResponse> => {
  try {
    const {data} = await axios.get<TrenchBotResponse>(
      `${process.env.TRENCHBOT_API}/${address}`,
    );

    return transformToCamelCase(data);
  } catch (error) {
    console.error("Error fetching analyze token:", error);
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrenchBotResponse | {error: string}>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({error: "Method Not Allowed"});
  }

  const {address} = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({error: "Invalid or missing address parameter"});
  }

  try {
    const metadata = await trenchBotAnalysisBundle(address);
    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({error: "Failed to fetch token metadata"});
  }
}
