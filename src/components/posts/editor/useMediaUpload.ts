import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import toast from "react-hot-toast";

export interface Attachment {
  file: File;
  isUploading: boolean;

  // Not avaiable before upload
  mediaId?: string;
  url?: string;
}

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin: (files) => {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();

        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });

      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);

      setUploadCompleted(false);
      return renamedFiles;
    },

    onUploadProgress: setUploadProgress,

    onClientUploadComplete: (res) => {
      setAttachments((prev) =>
        prev.map((attachment) => {
          const uploadResult = res.find(
            (result) => result.name === attachment.file.name,
          );

          if (!uploadResult) return attachment;
          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );

      setUploadCompleted(true);
    },

    onUploadError: (e) => {
      setAttachments((prev) =>
        prev.filter((attachment) => !attachment.isUploading),
      );

      if (e.message.includes("FileSizeMismatch")) {
        toast.error("One or more files exceed the maximum allowed size.");
      } else {
        toast.error(e.message);
      }
    },
  });

  const handleStartUpload = (files: File[]) => {
    if (isUploading) {
      toast.error("Please wait for the current upload to finish.");
      return;
    }

    if (attachments.length + files.length > 5) {
      toast.error("You can only upload up to 5 attachments per post.");
      return;
    }

    startUpload(files);
  };

  const removeAttachment = (fileName: string) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.file.name !== fileName),
    );
  };

  const reset = (onReset: () => void) => {
    setAttachments([]);
    setUploadProgress(undefined);

    if (onReset) onReset();
  };

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    uploadCompleted,
    setAttachments,
    removeAttachment,
    reset,
  };
}
