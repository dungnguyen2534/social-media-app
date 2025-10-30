import { Metadata } from "next";
import Search from "./Search";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  return <Search />;
}
