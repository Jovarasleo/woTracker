import { useEffect, useRef, useState } from "react";

export interface UndoAction {
  message: string;
  undo: () => Promise<unknown>;
}

export interface UndoOffer extends UndoAction {
  id: number;
}

const UNDO_TIMEOUT_MS = 6000;
/** Most offers shown at once; past this the oldest is dropped. */
const MAX_UNDO_OFFERS = 5;

export function useUndo() {
  const [undoOffers, setUndoOffers] = useState<UndoOffer[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

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
