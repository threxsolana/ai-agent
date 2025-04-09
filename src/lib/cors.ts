import {NextApiRequest, NextApiResponse} from "next";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export function cors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}
