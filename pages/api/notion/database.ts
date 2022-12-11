import { Client } from "@notionhq/client";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      const today = new Date();
      const nextMonth = ((today.getMonth() + 1) % 12) + 1;
      const year = today.getFullYear() + (today.getMonth() > nextMonth ? 1 : 0);

      const beforeDate = `${year}-${
        nextMonth < 10 ? "0" + nextMonth : nextMonth
      }-01`;

      const data: any = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID || "",

        filter: {
          property: "Date",
          date: {
            before: beforeDate,
          },
        },
      });

      res.status(200).json(data);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
