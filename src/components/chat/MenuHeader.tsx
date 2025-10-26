import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import NewChatDialog from "./NewChatDialog";

interface MenuHeaderProps {
  onChannelListClose: () => void;
}

export default function MenuHeader({ onChannelListClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2 px-3">
        <h1 className="me-auto text-lg font-medium">Messages</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNewChatDialog(true)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <hr className="my-1" />

      {showNewChatDialog && (
        <NewChatDialog
          open={showNewChatDialog}
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onChannelListClose();
          }}
        />
      )}
    </>
  );
}
