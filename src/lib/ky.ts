import { env } from "@/env";
import ky from "ky";

const apiURL = env.NEXT_PUBLIC_API_URL;

const api = ky.create({
  prefixUrl: apiURL,

  // the formatRelativeDate expects a Date value but the data return a string
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default api;
