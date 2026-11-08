import { useEffect, useRef, useState } from "react";

/** Something that was just done (e.g. a delete) and how to take it back. */
export interface UndoAction {
  /** Short description shown next to the Undo button ("Set removed"). */
  message: string;
  undo: () => Promise<unknown>;
}

/** An `UndoAction` currently offered to the user. */
export interface UndoOffer extends UndoAction {
  id: number;
}

/** How long each Undo offer stays up. */
const UNDO_TIMEOUT_MS = 6000;
/** Most offers shown at once; past this the oldest is dropped. */
const MAX_UNDO_OFFERS = 5;

/**
 * Undo offers for a page, oldest first. Every offered action gets its own
 * entry and timer, so several deletes in a row can each be undone.
 */
export function useUndo() {
  const [undoOffers, setUndoOffers] = useState<UndoOffer[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  // Don't let pending timers fire after the page is gone.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const dismissUndo = (id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setUndoOffers((offers) => offers.filter((offer) => offer.id !== id));
  };

  const offerUndo = (action: UndoAction) => {
    nextId.current += 1;
    const id = nextId.current;

    setUndoOffers((offers) =>
      [...offers, { ...action, id }].slice(-MAX_UNDO_OFFERS),
    );
    timers.current.set(
      id,
      setTimeout(() => dismissUndo(id), UNDO_TIMEOUT_MS),
    );
  };

  const undo = async (id: number) => {
    const offer = undoOffers.find((candidate) => candidate.id === id);

    if (!offer) {
      return;
    }

    // Hide first, so a second tap can't restore the same rows twice.
    dismissUndo(id);
    await offer.undo();
  };

  return { undoOffers, offerUndo, undo, dismissUndo };
}
