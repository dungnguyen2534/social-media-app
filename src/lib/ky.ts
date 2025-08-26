import ky from "ky";

const apiURL = process.env.NEXT_PUBLIC_API_URL;
if (!apiURL) {
  throw new ReferenceError(
    "The environment variable NEXT_PUBLIC_API_URL is not defined.",
  );
}

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
