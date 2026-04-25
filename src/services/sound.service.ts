import { Platform } from 'react-native';

type SoundType = {
  new(
    path: string | number,
    basePath: string | undefined,
    callback: (error?: Error) => void
  ): SoundInstance;
  setCategory: (category: string, mixWithOthers?: boolean) => void;
  MAIN_BUNDLE: string;
};

type SoundInstance = {
  play: (callback?: (success: boolean) => void) => void;
  reset: () => void;
  release: () => void;
  setVolume: (volume: number) => void;
};

let Sound: SoundType | null = null;

try {
  const soundModule = require('react-native-sound');
  Sound = soundModule.default || soundModule;
  if (Sound) {
    Sound.setCategory('Playback', true);
  }
} catch {
  // Sound library not available
}

// Task Complete sounds (with rotation)
const taskCompleteSounds: SoundInstance[] = [];
let taskCompleteIndex = 0;

// Other sounds
let newBoardSound: SoundInstance | null = null;
let letsGoSound: SoundInstance | null = null;
let completeCardSound: SoundInstance | null = null;

let soundsInitialized = false;
let isInitializing = false;

// Sound file name mapping
const soundFileMap: Record<string, string> = {
  'Task Complete/ES_Bubble Effect 04 - Epidemic Sound.mp3': 'task_complete_bubble',
  'Task Complete/ES_Button Press Click, Tap, Video Game, Main Menu, Select, Positive 02 - Epidemic Sound.mp3': 'task_complete_button',
  'Task Complete/ES_Mouth, Finger 02 - Epidemic Sound.mp3': 'task_complete_mouth',
  'Task Complete/ES_Pull Out, Release, Plop - Epidemic Sound.mp3': 'task_complete_plop',
  'Task Complete/ES_UI Buttons, Bubbly, Option - Epidemic Sound.mp3': 'task_complete_ui',
  'Start of New Board _ New Week/ES_Holy, Event, Chord - Epidemic Sound.mp3': 'new_board',
  'Just joined \'Let\'s Go\'/ES_Motion, Graphic, Slide, Interaction, Bright Chord, Warm 04 - Epidemic Sound.mp3': 'lets_go',
  'Complete Bingo Card Congratulations or Leaderboard/ES_Motion, Game, Jingle, Positive, Event, Chord - Epidemic Sound.mp3': 'complete_card',
};

const getSoundPath = (relativePath: string): string | number => {
  const mappedName = soundFileMap[relativePath];
  if (!mappedName) {
    if (__DEV__) {
      console.warn(`[Sound] Sound mapping not found for: ${relativePath}`);
    }
    const fallback = relativePath.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().replace(/\.(mp3|wav)$/, '');
    return Platform.OS === 'android' ? fallback : `${fallback}.mp3`;
  }

  if (Platform.OS === 'android') {
    return mappedName;
  }

  return `${mappedName}.mp3`;
};

const initializeSounds = (callback?: () => void) => {
  if (!Sound) {
    callback?.();
    return;
  }

  if (soundsInitialized || isInitializing) {
    callback?.();
    return;
  }

  isInitializing = true;

  try {
    const taskCompletePaths = [
      'Task Complete/ES_Bubble Effect 04 - Epidemic Sound.mp3',
      'Task Complete/ES_Button Press Click, Tap, Video Game, Main Menu, Select, Positive 02 - Epidemic Sound.mp3',
      'Task Complete/ES_Mouth, Finger 02 - Epidemic Sound.mp3',
      'Task Complete/ES_Pull Out, Release, Plop - Epidemic Sound.mp3',
      'Task Complete/ES_UI Buttons, Bubbly, Option - Epidemic Sound.mp3',
    ];

    const newBoardPath = 'Start of New Board _ New Week/ES_Holy, Event, Chord - Epidemic Sound.mp3';
    const letsGoPath = 'Just joined \'Let\'s Go\'/ES_Motion, Graphic, Slide, Interaction, Bright Chord, Warm 04 - Epidemic Sound.mp3';
    const completeCardPath = 'Complete Bingo Card Congratulations or Leaderboard/ES_Motion, Game, Jingle, Positive, Event, Chord - Epidemic Sound.mp3';

    let loadedCount = 0;
    const totalSounds = taskCompletePaths.length + 3;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalSounds) {
        soundsInitialized = true;
        isInitializing = false;
        callback?.();
      }
    };

    // Load task complete sounds
    taskCompletePaths.forEach(path => {
      const soundPath = getSoundPath(path);
      const sound = new Sound(
        soundPath,
        Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : undefined,
        error => {
          if (error) {
            if (__DEV__) {
              console.warn(`[Sound] Failed to load: ${path}`, error);
            }
          } else {
            sound.setVolume(1.0);
            taskCompleteSounds.push(sound);
            if (__DEV__) {
              console.log(`[Sound] Loaded: ${path}`);
            }
          }
          checkComplete();
        }
      );
    });

    // Load new board sound
    const newBoardSoundPath = getSoundPath(newBoardPath);
    newBoardSound = new Sound(
      newBoardSoundPath,
      Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : undefined,
      error => {
        if (error) {
          if (__DEV__) {
            console.warn(`[Sound] Failed to load new board sound:`, error);
          }
          newBoardSound = null;
        } else {
          newBoardSound?.setVolume(0.5);
          if (__DEV__) {
            console.log(`[Sound] Loaded new board sound`);
          }
        }
        checkComplete();
      }
    );

    // Load let's go sound
    const letsGoSoundPath = getSoundPath(letsGoPath);
    letsGoSound = new Sound(
      letsGoSoundPath,
      Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : undefined,
      error => {
        if (error) {
          if (__DEV__) {
            console.warn(`[Sound] Failed to load let's go sound:`, error);
          }
          letsGoSound = null;
        } else {
          letsGoSound?.setVolume(1.0);
          if (__DEV__) {
            console.log(`[Sound] Loaded let's go sound`);
          }
        }
        checkComplete();
      }
    );

    // Load complete card sound
    const completeCardSoundPath = getSoundPath(completeCardPath);
    completeCardSound = new Sound(
      completeCardSoundPath,
      Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : undefined,
      error => {
        if (error) {
          if (__DEV__) {
            console.warn(`[Sound] Failed to load complete card sound:`, error);
          }
          completeCardSound = null;
        } else {
          completeCardSound?.setVolume(1.0);
          if (__DEV__) {
            console.log(`[Sound] Loaded complete card sound`);
          }
        }
        checkComplete();
      }
    );
  } catch {
    isInitializing = false;
    callback?.();
  }
};

const playSound = (soundInstance: SoundInstance | null) => {
  if (!Sound) {
    if (__DEV__) {
      console.warn('[Sound] Sound library not available');
    }
    return;
  }

  if (!soundsInitialized) {
    if (__DEV__) {
      console.log('[Sound] Sounds not initialized, initializing now...');
    }
    initializeSounds(() => {
      if (soundInstance) {
        soundInstance.play(success => {
          if (!success) {
            if (__DEV__) {
              console.warn('[Sound] Failed to play sound');
            }
            soundInstance?.reset();
          }
        });
      }
    });
    return;
  }

  if (soundInstance) {
    soundInstance.play(success => {
      if (!success) {
        if (__DEV__) {
          console.warn('[Sound] Failed to play sound');
        }
        soundInstance?.reset();
      }
    });
  } else if (__DEV__) {
    console.warn('[Sound] Sound instance is null');
  }
};

export const playTaskCompleteSound = () => {
  try {
    if (taskCompleteSounds.length === 0) {
      if (__DEV__) {
        console.log('[Sound] Initializing sounds for task complete...');
      }
      initializeSounds(() => {
        if (taskCompleteSounds.length > 0) {
          const sound = taskCompleteSounds[taskCompleteIndex % taskCompleteSounds.length];
          playSound(sound);
          taskCompleteIndex = (taskCompleteIndex + 1) % taskCompleteSounds.length;
        } else if (__DEV__) {
          console.warn('[Sound] No task complete sounds loaded');
        }
      });
      return;
    }
    const sound = taskCompleteSounds[taskCompleteIndex % taskCompleteSounds.length];
    playSound(sound);
    taskCompleteIndex = (taskCompleteIndex + 1) % taskCompleteSounds.length;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Sound] Error playing task complete sound:', error);
    }
  }
};

export const playCardCheckSound = () => {
  try {
    if (taskCompleteSounds.length === 0) {
      initializeSounds(() => {
        if (taskCompleteSounds.length > 0) {
          const sound = taskCompleteSounds[taskCompleteIndex % taskCompleteSounds.length];
          playSound(sound);
          taskCompleteIndex = (taskCompleteIndex + 1) % taskCompleteSounds.length;
        }
      });
      return;
    }
    const sound = taskCompleteSounds[taskCompleteIndex % taskCompleteSounds.length];
    playSound(sound);
    taskCompleteIndex = (taskCompleteIndex + 1) % taskCompleteSounds.length;
  } catch {
    // Error playing sound
  }
};

export const playNewBoardSound = () => {
  try {
    playSound(newBoardSound);
  } catch {
    // Error playing sound
  }
};

export const playLetsGoSound = () => {
  try {
    playSound(letsGoSound);
  } catch {
    // Error playing sound
  }
};

export const playCompleteCardSound = () => {
  try {
    playSound(completeCardSound);
  } catch {
    // Error playing sound
  }
};

export const preloadSounds = () => {
  if (!Sound) {
    return;
  }
  initializeSounds();
};

export const releaseSounds = () => {
  if (!Sound) {
    return;
  }

  try {
    taskCompleteSounds.forEach(sound => sound?.release());
    taskCompleteSounds.length = 0;
    newBoardSound?.release();
    letsGoSound?.release();
    completeCardSound?.release();
    newBoardSound = null;
    letsGoSound = null;
    completeCardSound = null;
    soundsInitialized = false;
    isInitializing = false;
    taskCompleteIndex = 0;
  } catch {
    // Error releasing sounds
  }
};
