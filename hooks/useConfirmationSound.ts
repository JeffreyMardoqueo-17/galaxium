"use client";

import * as React from "react";

const CONFIRMATION_SOUND_SRC = "/songs/confirm.mp3";

export function useConfirmationSound() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const warmupPromiseRef = React.useRef<Promise<void> | null>(null);
  const unlockedRef = React.useRef(false);

  React.useEffect(() => {
    const audio = new Audio(CONFIRMATION_SOUND_SRC);
    audio.preload = "auto";
    audio.volume = 0.7;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      warmupPromiseRef.current = null;
      unlockedRef.current = false;
    };
  }, []);

  const prime = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio || unlockedRef.current || warmupPromiseRef.current) {
      return;
    }

    warmupPromiseRef.current = (async () => {
      const previousMutedState = audio.muted;

      try {
        audio.muted = true;
        audio.currentTime = 0;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        unlockedRef.current = true;
      } catch {
        // El audio nunca debe interferir con la compra o la venta.
      } finally {
        audio.muted = previousMutedState;
      }
    })().finally(() => {
      warmupPromiseRef.current = null;
    });
  }, []);

  const play = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    void (async () => {
      try {
        await warmupPromiseRef.current;
        audio.pause();
        audio.muted = false;
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.debug("[AUDIO] No se pudo reproducir el sonido de confirmacion.", error);
      }
    })();
  }, []);

  return { prime, play };
}
