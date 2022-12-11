import Head from "next/head";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import styles from "../styles/Home.module.css";
import { activity } from "../types/activity";
import { athlete } from "../types/athlete";

const Home = () => {
  const [athlete, setAthlete] = useState<athlete | null>(null);
  const [activities, setActivities] = useState<activity[] | []>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("stravaAccessToken"));
    }
  }, []);

  const getAuthorizeUrl = (): string => {
    const baseUrl = "http://www.strava.com/oauth/authorize";

    const clientId = "98184";
    const clientIdParam = "client_id=" + clientId;

    const responseCodeParam = "response_type=code";

    // const redirectUrl = "http://localhost:3000/";
    const redirectUrl = "http://localhost:3008/exchange_token";
    const redirectUrlParam = "redirect_uri=" + redirectUrl;

    const approvalPromptParam = "approval_prompt=auto"; //force

    const scope = "activity:read";
    const scopeParam = "scope=" + scope;

    const authorizeUrl =
      baseUrl +
      "?" +
      clientIdParam +
      "&" +
      responseCodeParam +
      "&" +
      redirectUrlParam +
      "&" +
      approvalPromptParam +
      "&" +
      scopeParam;

    // "http://www.strava.com/oauth/authorize?client_id=98184&response_type=code&redirect_uri=http://localhost:3000/&approval_prompt=force&scope=activity:read"
    return authorizeUrl;
  };

  const loginStrava = () => {
    window.location.assign(getAuthorizeUrl());
  };

  const fetchData = async (url: string, method: string = "GET") => {
    const response = await fetch(url, {
      method: method,
    });
    const data = await response.json();
    return data;
  };

  const getAthlete = async () => {
    const athlete = await fetchData(`/api/athlete/${accessToken}`);
    setAthlete(athlete);
  };

  const getActivities = async () => {
    const activities = await fetchData(`/api/activities/${accessToken}`);
    setActivities(activities);
  };

  const getPace = (time: number, distance: number): string => {
    const timeInMinutes: number = time / 60;

    const pace = (timeInMinutes / distance) * 1000;
    const paceFloat = Math.floor((pace % 1) * 100);
    const paceInt = Math.floor(pace);

    return paceInt + ":" + Math.round((paceFloat * 60) / 100);
  };

  const updateTodayActivity = async () => {
    const response = await fetch(
      `http://localhost:3008/api/notion/${accessToken}`,
      {
        method: "PATCH",
      }
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Running Tracker</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Running Tracker</h1>
        <h2 className="text-4xl">from Runners to Runners</h2>

        <div className="mt-8">
          <Button onClick={loginStrava} color="bg-orange-500" stravaIcon>
            Login to Strava
          </Button>
        </div>

        <div className="flex flex-col items-center mt-4 gap-4">
          <h2 className="text-4xl">Access Token</h2>
          <div>{accessToken ?? "You need to login to Strava"}</div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={updateTodayActivity} disabled={!accessToken}>
            Add Today Strava Activity to Notion
          </Button>
        </div>

        <div className="flex flex-row gap-8 mt-4">
          <div className="flex flex-col items-center my-4 gap-4">
            <h2 className="text-4xl">Athlete Info</h2>
            <Button onClick={getAthlete} disabled={!accessToken}>
              Show Athlete
            </Button>
            {athlete ? (
              <pre key={athlete.id}>{JSON.stringify(athlete, null, 2)}</pre>
            ) : null}
          </div>

          <div className="flex flex-col items-center my-4 gap-4">
            <h2 className="text-4xl">Activities</h2>
            <Button onClick={getActivities} disabled={!accessToken}>
              Show Activities
            </Button>
            {activities.length > 0 ? (
              <div>
                {activities.map((activity: any) => {
                  activity = {
                    ...activity,
                    map: "",
                    pace: getPace(
                      parseFloat(activity.moving_time),
                      activity.distance
                    ),
                  };
                  return (
                    <pre key={activity.id}>
                      {JSON.stringify(activity, null, 2)}
                    </pre>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
