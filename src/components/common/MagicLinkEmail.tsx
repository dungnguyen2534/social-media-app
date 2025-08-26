import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Preview,
  Tailwind,
} from "@react-email/components";
import { render } from "@react-email/render";

interface MagicLinkEmailProps {
  url: string;
  host: string;
}

export function MagicLinkEmail({ url, host }: MagicLinkEmailProps) {
  const previewText = `Sign in to ${host}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-md border border-solid border-[#eaeaea] p-[20px]">
            <Text className="text-[14px] leading-[24px] text-black">
              Hello,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              You recently requested to sign in on{" "}
              <b className="font-bold">{host}</b>
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Click the button below to continue:
            </Text>
            <Button
              className="mx-auto block rounded-md bg-[#000000] px-5 py-3 text-center text-[14px] font-semibold text-white no-underline"
              href={url}
            >
              Sign in to {host}
            </Button>
            <Text className="text-[14px] leading-[24px] text-black">
              If you didn&apos;t request this, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export async function renderMagicLinkEmail(url: string, host: string) {
  const html = await render(<MagicLinkEmail url={url} host={host} />, {
    pretty: true,
  });
  const text = await render(<MagicLinkEmail url={url} host={host} />, {
    plainText: true,
  });
  return { html, text };
}
