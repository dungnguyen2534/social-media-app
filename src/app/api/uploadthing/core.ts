import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
  avatar: f({
    image: {
      maxFileSize: "512KB",
    },
  })
    .middleware(async () => {
      const session = await getSessionData();
      if (!session?.user) throw new UploadThingError("Unauthorized");

      // Accessible in onUploadComplete as `metadata`
      return { user: session?.user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.image;
      if (oldAvatarUrl && oldAvatarUrl.includes(".ufs.sh")) {
        await utapi.deleteFiles(oldAvatarUrl.split("/").pop()!);
      }

      const avatarUrl = file.ufsUrl;
      await prisma.user.update({
        where: { id: metadata.user.id },
        data: {
          image: avatarUrl,
        },
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { avatarUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
