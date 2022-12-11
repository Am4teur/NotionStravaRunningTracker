import { useRouter } from "next/router";
import { useEffect } from "react";

const Token = () => {
  const router = useRouter();
  const { code } = router.query;

  const getTokenUrl = (code: any): string => {
    const baseUrl = "https://www.strava.com/oauth/token";

    const clientId = "98184";
    const clientIdParam = "client_id=" + clientId;

    const clientSecret = "dc0c63923d0e986e8fc9e7cf607b8180af0dc7ea";
    const clientSecretParam = "client_secret=" + clientSecret;

    const codeParam = "code=" + code;

    const grantTypeParam = "grant_type=authorization_code";

    const tokenUrl =
      baseUrl +
      "?" +
      clientIdParam +
      "&" +
      clientSecretParam +
      "&" +
      codeParam +
      "&" +
      grantTypeParam;

    // https://www.strava.com/oauth/token?client_id=98184&client_secret=dc0c63923d0e986e8fc9e7cf607b8180af0dc7ea&code=d7e47916d6dcdd554259fa134843b1dd9d3ef027&grant_type=authorization_code
    return tokenUrl;
  };

  useEffect(() => {
    const fetchAccessToken = async (code: any) => {
      const resp = await fetch(getTokenUrl(code), { method: "POST" });
      const data = await resp.json();

      if (typeof window !== "undefined" && data.access_token) {
        localStorage.setItem("stravaAccessToken", data.access_token.toString());
      }

      router.push("/");
    };

    if (code) {
      fetchAccessToken(code);
    }
  }, [router, code]);

  return code ? (
    <>
      <div>You are logged in with the code:</div>
      <br />
      <p>{code}</p>
    </>
  ) : (
    <div>Why are you here?</div>
  );
};

export default Token;
