// Global Real-time Audio Broadcast Client Manager for CalcPlanet
// Features dual-engine playback, aggressive background auto-unlock, and seamless real-time playback

export interface BroadcastSoundEvent {
  id: string;
  title: string;
  audioData: string; // URL or base64 data URI
  volume: number; // 0 to 1
  timestamp: number;
  sender: string;
}

export type BroadcastPresenceCallback = (onlineListeners: number) => void;
export type BroadcastAudioStateCallback = (isPlaying: boolean, currentEvent: BroadcastSoundEvent | null, isBlocked: boolean) => void;

const BROADCAST_CHANNEL_NAME = 'calcplanet_audio_broadcast_channel';
const STORAGE_KEY = 'calcplanet_latest_sound_broadcast';

class AudioBroadcastManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((event: BroadcastSoundEvent) => void)[] = [];
  private presenceListeners: BroadcastPresenceCallback[] = [];
  private stateListeners: BroadcastAudioStateCallback[] = [];
  
  private isUserInteracted = false;
  private audioContext: AudioContext | null = null;
  private currentActiveAudio: HTMLAudioElement | null = null;
  private eventSource: EventSource | null = null;
  private isConnecting = false;
  private onlineListenersCount = 1;
  private playedEventIds = new Set<string>();
  
  // Pending broadcast waiting for user click/tap to unblock autoplay
  private pendingBroadcast: BroadcastSoundEvent | null = null;
  private isCurrentlyPlaying = false;
  private currentPlayingEvent: BroadcastSoundEvent | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Setup local cross-tab BroadcastChannel
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          this.channel.onmessage = (event) => {
            if (event.data && event.data.audioData) {
              this.handleIncomingBroadcast(event.data);
            }
          };
        } catch (e) {
          console.warn('BroadcastChannel error:', e);
        }
      }

      // 2. Setup localStorage sync fallback
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.handleIncomingBroadcast(parsed);
          } catch {
            // Ignore
          }
        }
      });

      // 3. Proactive & multi-event audio context unblocker
      const triggerUnlock = () => {
        this.isUserInteracted = true;
        this.initAudioContext();

        // If a sound broadcast was in queue, play it immediately!
        if (this.pendingBroadcast) {
          const pending = this.pendingBroadcast;
          this.pendingBroadcast = null;
          this.playSound(pending.audioData, pending.volume, pending).catch(() => {});
        }
      };

      // Listen on all passive & active visitor events
      const eventTypes = [
        'click', 
        'keydown', 
        'touchstart', 
        'touchend', 
        'pointerdown', 
        'mousedown', 
        'scroll', 
        'wheel', 
        'mousemove',
        'focus'
      ];

      eventTypes.forEach((evt) => {
        window.addEventListener(evt, triggerUnlock, { passive: true });
        document.addEventListener(evt, triggerUnlock, { passive: true });
      });

      // Proactively initialize on startup
      try {
        this.initAudioContext();
      } catch {
        // Handled
      }

      // 4. Initialize Global Server SSE Connection
      this.connectToServerStream();
    }
  }

  public initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.isUserInteracted = true;
        }).catch(() => {});
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  public connectToServerStream() {
    if (typeof window === 'undefined' || this.isConnecting) return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.isConnecting = true;
      const es = new EventSource('/api/broadcast/stream');
      this.eventSource = es;

      es.onopen = () => {
        this.isConnecting = false;
      };

      es.onmessage = (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);

          if (data.type === 'sound' && data.event) {
            this.handleIncomingBroadcast(data.event);
          } else if (data.type === 'presence' || data.type === 'connected') {
            if (typeof data.onlineListeners === 'number') {
              this.onlineListenersCount = data.onlineListeners;
              this.notifyPresence(data.onlineListeners);
            }
          }
        } catch {
          // Heartbeats or parse ignore
        }
      };

      es.onerror = () => {
        this.isConnecting = false;
        // Reconnect after 3s
        setTimeout(() => {
          this.connectToServerStream();
        }, 3000);
      };
    } catch (e) {
      this.isConnecting = false;
      console.warn('Server SSE stream connection note:', e);
    }
  }

  public isAutoplayUnlocked(): boolean {
    return this.isUserInteracted || (this.audioContext ? this.audioContext.state === 'running' : false);
  }

  public getOnlineListenersCount(): number {
    return this.onlineListenersCount;
  }

  public subscribe(callback: (event: BroadcastSoundEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public subscribePresence(callback: BroadcastPresenceCallback): () => void {
    this.presenceListeners.push(callback);
    callback(this.onlineListenersCount);
    return () => {
      this.presenceListeners = this.presenceListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeState(callback: BroadcastAudioStateCallback): () => void {
    this.stateListeners.push(callback);
    callback(this.isCurrentlyPlaying, this.currentPlayingEvent, !!this.pendingBroadcast);
    return () => {
      this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyState(isPlaying: boolean, currentEvent: BroadcastSoundEvent | null, isBlocked: boolean) {
    this.isCurrentlyPlaying = isPlaying;
    this.currentPlayingEvent = currentEvent;
    this.stateListeners.forEach((cb) => {
      try {
        cb(isPlaying, currentEvent, isBlocked);
      } catch {
        // Ignore
      }
    });
  }

  // Force play currently pending or incoming audio (e.g. when user clicks notification)
  public forcePlayPending() {
    this.isUserInteracted = true;
    this.initAudioContext();
    if (this.pendingBroadcast) {
      const event = this.pendingBroadcast;
      this.pendingBroadcast = null;
      this.playSound(event.audioData, event.volume, event).catch(() => {});
    }
  }

  // Global broadcast to ALL visitors on every computer worldwide
  public async broadcastSound(
    title: string,
    audioData: string,
    volume: number = 0.85,
    sender: string = 'Admin'
  ): Promise<{ success: boolean; deliveredToCount: number; event: BroadcastSoundEvent }> {
    const payload = {
      title: title || 'Global Audio Broadcast',
      audioData,
      volume: Math.min(1, Math.max(0, volume)),
      sender: sender || 'Admin (fastyjay)',
    };

    // 1. Transmit to server API to distribute globally via SSE
    try {
      const res = await fetch('/api/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.event) {
          this.handleIncomingBroadcast(data.event);
          return {
            success: true,
            deliveredToCount: data.deliveredToCount || this.onlineListenersCount,
            event: data.event,
          };
        }
      }
    } catch (err) {
      console.warn('Server broadcast POST note, falling back to local multi-tab broadcast:', err);
    }

    // Local Fallback
    const localEvent: BroadcastSoundEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: payload.title,
      audioData: payload.audioData,
      volume: payload.volume,
      timestamp: Date.now(),
      sender: payload.sender,
    };

    if (this.channel) {
      this.channel.postMessage(localEvent);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localEvent));
    } catch {
      // Storage quota safety
    }

    this.handleIncomingBroadcast(localEvent);

    return {
      success: true,
      deliveredToCount: this.onlineListenersCount,
      event: localEvent,
    };
  }

  // Dual-Engine Audio Player (HTML5 Audio + Web Audio decode fallback)
  public async playSound(audioData: string, volume: number = 0.85, eventMeta?: BroadcastSoundEvent): Promise<void> {
    const safeVolume = Math.min(1, Math.max(0, volume));

    // Try Method 1: Web Audio API Buffer Decode (Bypasses many HTML5 element autoplay restrictions if context is active)
    const playViaWebAudio = async (): Promise<void> => {
      const ctx = this.initAudioContext();
      if (!ctx) throw new Error('Web Audio API not supported');

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      let arrayBuffer: ArrayBuffer;
      if (audioData.startsWith('data:')) {
        const base64 = audioData.split(',')[1];
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const res = await fetch(audioData);
        arrayBuffer = await res.arrayBuffer();
      }

      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      
      source.buffer = decodedBuffer;
      gainNode.gain.value = safeVolume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      return new Promise((resolve) => {
        source.onended = () => {
          this.notifyState(false, null, false);
          resolve();
        };
        this.notifyState(true, eventMeta || null, false);
        source.start(0);
      });
    };

    // Try Method 2: HTML5 Audio Element
    const playViaAudioElement = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          if (this.currentActiveAudio) {
            this.currentActiveAudio.pause();
            this.currentActiveAudio = null;
          }

          const audio = new Audio();
          audio.src = audioData;
          audio.volume = safeVolume;
          audio.preload = 'auto';

          this.currentActiveAudio = audio;

          const onEnded = () => {
            this.notifyState(false, null, false);
            resolve();
          };

          audio.onended = onEnded;
          audio.onerror = (e) => {
            reject(new Error(`HTML5 Audio error: ${e}`));
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.notifyState(true, eventMeta || null, false);
                resolve();
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            this.notifyState(true, eventMeta || null, false);
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    };

    // Execute first via AudioContext (often unblocked earlier by mousemove/scroll/keys), fallback to Audio element
    try {
      await playViaWebAudio();
    } catch {
      try {
        await playViaAudioElement();
      } catch (audioElErr: unknown) {
        const isNotAllowed = audioElErr && typeof audioElErr === 'object' && 'name' in audioElErr && (audioElErr as { name: string }).name === 'NotAllowedError';
        
        if (isNotAllowed) {
          if (eventMeta) {
            this.pendingBroadcast = eventMeta;
            this.notifyState(false, eventMeta, true);
          }
          throw audioElErr;
        }

        this.notifyState(false, null, false);
        throw audioElErr;
      }
    }
  }

  private handleIncomingBroadcast(event: BroadcastSoundEvent) {
    if (!event || !event.id) return;

    // Deduplicate
    if (this.playedEventIds.has(event.id)) {
      return;
    }
    this.playedEventIds.add(event.id);

    if (this.playedEventIds.size > 100) {
      const first = Array.from(this.playedEventIds)[0];
      this.playedEventIds.delete(first);
    }

    // Notify UI listeners (displays the toast / notification)
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('Error notifying broadcast listener:', e);
      }
    });

    // Automatically play the audio immediately
    this.playSound(event.audioData, event.volume, event).catch(() => {
      // Auto-queued if browser is in cold strict mode
    });
  }

  private notifyPresence(count: number) {
    this.presenceListeners.forEach((cb) => {
      try {
        cb(count);
      } catch (e) {
        console.error('Error notifying presence listener:', e);
      }
    });
  }
}

export const audioBroadcast = new AudioBroadcastManager();
