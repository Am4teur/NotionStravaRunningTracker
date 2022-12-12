import { Client } from "@notionhq/client";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const fetchData = async (url: string, method: string = "GET") => {
  const response = await fetch(url, {
    method: method,
  });

  const data = await response.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    query: { accessToken },
    method,
  } = req;

  switch (method) {
    case "PATCH":
      //get next month
      const today = new Date();
      const nextMonth = ((today.getMonth() + 1) % 12) + 1;
      const year = today.getFullYear() + (today.getMonth() > nextMonth ? 1 : 0);

      const beforeDate = `${year}-${
        nextMonth < 10 ? "0" + nextMonth : nextMonth
      }-01`;

      // get notion db
      const data: any = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID || "",

        filter: {
          property: "Date",
          date: {
            before: beforeDate,
          },
        },
      });

      // get today row from notion db
      const todayFormattedDate = today.toISOString().split("T")[0];

      const rowToUpdate = data.results.find(
        (res: any) => res.properties.Date.date.start === todayFormattedDate
      );

      const pageIdToUpdate = rowToUpdate?.id;

      const checkboxState = rowToUpdate.properties.Tracker.checkbox;

      //get activities
      const activities = await fetchData(
        `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/activities/${accessToken}`
      );

      const testingFormattedDate = "2022-12-10"; // todayFormattedDate
      const activityToUpdate = activities.find(
        (activity: any) =>
          activity.start_date.split("T")[0] === todayFormattedDate // testingFormattedDate
      );
      if (!activityToUpdate) {
        res
          .status(500)
          .json({ error: "!There is no activity today on Strava!" });
        return;
      }

      const getPace = (time: number, distance: number): number => {
        const timeInMinutes: number = time / 60;

        const pace = (timeInMinutes / distance) * 1000;
        const paceFloat = Math.floor((pace % 1) * 100);
        const paceInt = Math.floor(pace);

        // return paceInt + ":" + Math.round((paceFloat * 60) / 100);
        return parseFloat(paceInt + "." + Math.round((paceFloat * 60) / 100));
      };

      const getKm = (distance: number): number => {
        return Math.round(distance) / 1000;
      };

      const getTime = (time: number): number => {
        return Math.round((time / 60) * 100) / 100;
      };

      // update
      const response1 = await notion.pages.update({
        page_id: pageIdToUpdate,
        properties: {
          Tracker: {
            checkbox: !checkboxState,
          },
        },
      });
      const response2 = await notion.pages.update({
        page_id: pageIdToUpdate,
        properties: {
          Pace: {
            number: getPace(
              parseFloat(activityToUpdate.moving_time),
              activityToUpdate.distance
            ),
          },
        },
      });
      const response3 = await notion.pages.update({
        page_id: pageIdToUpdate,
        properties: {
          Km: {
            number: getKm(activityToUpdate.distance),
          },
        },
      });
      const response4 = await notion.pages.update({
        page_id: pageIdToUpdate,
        properties: {
          Time: {
            number: getTime(activityToUpdate.moving_time),
          },
        },
      });

      res.status(200).json(response4);
      break;
    default:
      res.setHeader("Allow", ["PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
