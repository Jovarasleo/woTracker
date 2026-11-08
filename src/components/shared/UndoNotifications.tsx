import { Button, Notification } from "@mantine/core";
import { type UndoOffer } from "../../hooks/shared/useUndo";

interface Props {
  /** Oldest first; the newest is shown at the bottom, nearest the thumb. */
  offers: UndoOffer[];
  onUndo: (id: number) => void;
  onDismiss: (id: number) => void;
}

/**
 * Stack of "Set removed · Undo" messages, one per recent delete. On phones it
 * sits just above the bottom navigation bar of `PageLayout`; from `sm` up at
 * the bottom edge.
 */
export function UndoNotifications({ offers, onUndo, onDismiss }: Props) {
  if (!offers.length) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.5rem)] z-60 mx-auto flex w-full max-w-xl flex-col gap-2 px-4 sm:bottom-4"
    >
      {offers.map((offer) => (
        <Notification
          key={offer.id}
          withBorder
          onClose={() => onDismiss(offer.id)}
          closeButtonProps={{ "aria-label": "Dismiss" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{offer.message}</span>
            <Button
              variant="default"
              size="xs"
              onClick={() => onUndo(offer.id)}
            >
              Undo
            </Button>
          </div>
        </Notification>
      ))}
    </div>
  );
}
