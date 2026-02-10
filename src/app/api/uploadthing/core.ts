import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth"; // Your existing auth helper

const f = createUploadthing();

export const ourFileRouter = {
  // Define a route for "imageUploader"
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // !!! return the URL to the client !!!
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
