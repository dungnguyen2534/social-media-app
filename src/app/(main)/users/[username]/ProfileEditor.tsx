"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { UserData } from "@/lib/type";
import { userProfileData, userProfileSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useUpdateProfileMutation } from "./mutations";
import RHFForm from "@/components/form/RHFForm";
import RHFInput from "@/components/form/RHFInput";
import RHFTextarea from "@/components/form/RHFTextarea";
import LoadingButton from "@/components/common/LoadingButton";
import UserAvatar from "@/components/common/UserAvatar";
import { Camera } from "lucide-react";
import CropImageDialog from "@/components/common/CropImageDialog";
import Resizer from "react-image-file-resizer";

interface ProfileEditorProps {
  user: UserData;
}

export function ProfileEditor({ user }: ProfileEditorProps) {
  const form = useForm<userProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      username: user.username!,
      name: user.name!,
      bio: user.bio || "",
    },
  });

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [isPendingTransition, startTransition] = useTransition();

  const mutation = useUpdateProfileMutation();
  const onSubmit = async (data: userProfileData) => {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`)
      : undefined;

    startTransition(async () => {
      mutation.mutate(
        { data, avatar: newAvatarFile },
        {
          onSuccess: () => {
            setCroppedAvatar(null);
            setShowDialog(false);
          },
        },
      );
    });
  };

  const isUsernameChangeable = user.usernameUpdatedAt
    ? new Date().getTime() - user.usernameUpdatedAt.getTime() >
      30 * 24 * 60 * 60 * 1000
    : true;

  return (
    <>
      <Button variant="custom" onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="responsive-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <hr />

          <AvatarInput
            avatarUrl={
              croppedAvatar ? URL.createObjectURL(croppedAvatar) : user.image
            }
            onImageCropped={setCroppedAvatar}
            className="mx-auto"
          />

          <RHFForm form={form} onSubmit={onSubmit} className="space-y-3">
            <RHFInput
              control={form.control}
              name="name"
              label="Display name"
              placeholder="e.g., John"
            />

            <RHFInput
              control={form.control}
              name="username"
              label="Username"
              placeholder="something_unique"
              disabled={!isUsernameChangeable}
              description="You can only change your username once every 30 days."
            />

            <RHFTextarea
              control={form.control}
              name="bio"
              label="Bio"
              placeholder="A short bio about yourself"
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={mutation.isPending || isPendingTransition}
                disabled={!form.formState.isDirty && !croppedAvatar}
                className="w-full"
              >
                Save
              </LoadingButton>
            </DialogFooter>
          </RHFForm>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AvatarInputProps {
  avatarUrl: string | null | undefined;
  onImageCropped: (blob: Blob | null) => void;
  className?: string;
}

function AvatarInput({
  avatarUrl,
  onImageCropped,
  className,
}: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onImageSelected = (image: File | undefined) => {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative block"
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          className="size-20 md:size-28"
          iconStyle="size-10 md:size-16"
        />
        <span className="absolute -right-1 bottom-0 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white transition-colors duration-200 hover:bg-black/50">
          <Camera className="size-5" />
        </span>
      </button>

      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);

            // to trigger state changes if user choose an image, close, then choose the same image again
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </div>
  );
}
