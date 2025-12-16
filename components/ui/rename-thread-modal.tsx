"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface RenameThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => Promise<void> | void;
  currentTitle: string;
}

export function RenameThreadModal({ isOpen, onClose, onConfirm, currentTitle }: RenameThreadModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleConfirm = async () => {
    if (!title.trim() || title.trim() === currentTitle) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onConfirm(title.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Conversation</DialogTitle>
          <DialogDescription>Give the conversation a new name.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Conversation title"
            disabled={isSaving}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); } }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving || !title.trim()}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
