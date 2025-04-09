import {NextApiRequest, NextApiResponse} from "next";
import {transformToCamelCase} from "transform-obj";

export const getMetadataToken = async (address: string): Promise<GetMetadataResponse> => {
  const API_URL = process.env.PUMPFUN_API;

  try {
    const response = await fetch(`${API_URL}/coins/${address}?sync=true`, {
      next: {revalidate: 60},
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = (await response.json()) as GetMetadataResponse;
    return transformToCamelCase(data);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    GetMetadataResponse | {error: string; message?: string; details?: string}
  >,
) {
  if (req.method !== "GET") {
    return res.status(405).json({error: "Method Not Allowed"});
  }

  const {address} = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({error: "Address parameter is required"});
  }

  try {
    const metadata = await getMetadataToken(address);
    return res.status(200).json(metadata);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("HTTP error! Status: 404")) {
        return res.status(404).json({error: "Token not found"});
      }

      if (error.message.includes("HTTP error! Status:")) {
        return res.status(502).json({
          error: "External API error",
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      error: "Failed to fetch token metadata",
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
    });
  }
}
