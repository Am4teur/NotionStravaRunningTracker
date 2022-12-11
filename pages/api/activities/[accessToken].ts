// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { accessToken },
    method,
  } = req;

  switch (method) {
    case "GET":
      const token: string = `Bearer ${accessToken}`;
      const response = await fetch(
        "https://www.strava.com/api/v3/athlete/activities?page=1&per_page=30",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const data = await response.json();

      res.status(200).json(data);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
