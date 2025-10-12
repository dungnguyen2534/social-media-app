import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import { MiniProfileOnTag } from "./MiniProfile";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  return <LinkifyUrl>{children}</LinkifyUrl>;
}

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkItUrl className="app-link text-blue-500">{children}</LinkItUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        const username = match.slice(1);
        return (
          <MiniProfileOnTag key={key} username={username}>
            {match}
          </MiniProfileOnTag>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9_]+)/}
      component={(match, key) => {
        const hashtag = match.slice(1);
        return (
          <Link key={key} href={`/hashtags/${hashtag}`} className="app-link">
            {match}
          </Link>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}
