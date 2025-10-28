import { useRef } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import "cropperjs/dist/cropper.css";

interface CropImageDialog {
  src: string;
  cropAspectRatio: number;
  onCropped: (blob: Blob | null) => void;
  onClose: () => void;
}

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onCropped,
  onClose,
}: CropImageDialog) {
  const cropperRef = useRef<ReactCropperElement>(null);

  const crop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="responsive-dialog">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <hr />
        </DialogHeader>
        <div className="ring-ring/50 ring-1">
          <Cropper
            src={src}
            aspectRatio={cropAspectRatio}
            guides={false}
            zoomable={false}
            ref={cropperRef}
            className="mx-auto size-fit"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={crop}>Crop</Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
