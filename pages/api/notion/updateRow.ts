import { Client } from "@notionhq/client";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const fakeStravaActivity = {
  distance: 123,
  moving_time: "123",
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

const getOneMonthLater = (): string => {
  //get next month
  const today = new Date();
  const nextMonth = ((today.getMonth() + 1) % 12) + 1;
  const year = today.getFullYear() + (today.getMonth() > nextMonth ? 1 : 0);

  return `${year}-${nextMonth < 10 ? "0" + nextMonth : nextMonth}-01`;
};

/*
  {
    results: [
      {

      }
    ]
  }
*/
const getNotionDB = async (beforeDate: string) => {
  return await notion.databases.query({
    database_id: process.env.NOTION_DB_ID || "",
    filter: {
      property: "Date",
      date: {
        before: beforeDate,
      },
    },
  });
};

/*
  input:
    date: "20-1-2023"
  output:
    "2023-20-1"
*/
const getDateFormatted = (date: string): string => {
  const dateToUpdate = new Date(
    (Array.isArray(date) ? date[0] : date).replaceAll("-", "/")
  );
  return dateToUpdate.toISOString().split("T")[0];
};

const getNotionRowId = (notionData: any, dateToUpdateFormatted: string) => {
  const rowToUpdate = notionData.results.find(
    (res: any) => res.properties.Date.date.start === dateToUpdateFormatted
  );
  return [rowToUpdate?.id, rowToUpdate.properties.Tracker.checkbox];
};

const getActivityToUpdate = async (
  stravaAccessToken: string,
  dateToUpdateFormatted: string
) => {
  // get all Strava activities
  const activities = await fetchData(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/activities/${stravaAccessToken}`
  );

  // const activityToUpdate = fakeStravaActivity;
  const activityToUpdate = activities.find(
    (activity: any) =>
      activity.start_date.split("T")[0] === dateToUpdateFormatted // testingFormattedDate
  );

  return activityToUpdate;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    method,
    body: { stravaAccessToken, date },
  } = req;

  if (!date) {
    res.status(400).end("Date is not correct");
    return;
  }
  // isDateCorrect(date) ...

  switch (method) {
    case "PATCH":
      // get notion db
      const notionData = await getNotionDB(getOneMonthLater());

      // get today Or dateToUpdate row from notion db
      const dateToUpdateFormatted = getDateFormatted(date);
      // const testingFormattedDate = "2022-12-10";

      const [notionRowId, checkboxState] = getNotionRowId(
        notionData,
        dateToUpdateFormatted
      );

      //get activities
      const activityToUpdate = await getActivityToUpdate(
        stravaAccessToken,
        dateToUpdateFormatted
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
        page_id: notionRowId,
        properties: {
          Tracker: {
            checkbox: !checkboxState,
          },
        },
      });
      const response2 = await notion.pages.update({
        page_id: notionRowId,
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
        page_id: notionRowId,
        properties: {
          Km: {
            number: getKm(activityToUpdate.distance),
          },
        },
      });
      const response4 = await notion.pages.update({
        page_id: notionRowId,
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
