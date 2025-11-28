// Fix: Use 'any' type and window.Audio to bypass TypeScript errors about missing Audio/HTMLAudioElement types
const createAudio = (url: string): any => {
  if (typeof window !== 'undefined' && (window as any).Audio) {
    return new (window as any).Audio(url);
  }
  return null;
};

const sounds: Record<string, any> = {
  bounce: createAudio('https://assets.mixkit.co/active_storage/sfx/2077/2077-preview.mp3'),
  swish: createAudio('https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3'),
  rim: createAudio('https://assets.mixkit.co/active_storage/sfx/2078/2078-preview.mp3'),
  backboard: createAudio('https://assets.mixkit.co/active_storage/sfx/2076/2076-preview.mp3'),
  cheer: createAudio('https://assets.mixkit.co/active_storage/sfx/2068/2068-preview.mp3'),
};

// Preload sounds
Object.values(sounds).forEach(s => {
    if (s) {
        s.load();
        s.crossOrigin = "anonymous";
    }
});

export const playSound = (name: string, volume: number = 1) => {
  const sound = sounds[name];
  if (sound) {
    // Clone to allow overlapping sounds (polyphony)
    const clone = sound.cloneNode();
    if (clone) {
        clone.volume = Math.min(Math.max(volume, 0), 1);
        clone.play().catch((e: any) => console.warn("Audio play failed", e));
    }
  }
};
