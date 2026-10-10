import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Radio, 
  Volume2, 
  Upload, 
  Play, 
  Square, 
  Sparkles, 
  Trash2, 
  Check, 
  ExternalLink, 
  Activity, 
  Flame, 
  Music, 
  FileAudio,
  RadioTower,
  Sliders,
  RotateCcw,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import { audioBroadcast, BroadcastSoundEvent } from './utils/audioBroadcast';
import { 
  generateAirhornWav, 
  generateVineBoomWav, 
  generateLevelUpWav, 
  generateVictoryWav, 
  generateCoinWav, 
  generateLaserWav, 
  generateSirenWav 
} from './utils/synthesizedSounds';
import { ParticleBackground } from './components/ParticleBackground';
import './index.css';

// Preset sound collection for instant testing (Generated with high quality 100% reliable PCM audio)
const SOUND_PRESETS = [
  {
    id: 'airhorn',
    name: 'Airhorn MLG Blast',
    category: 'Meme',
    getAudio: () => generateAirhornWav(),
    icon: '🎺',
  },
  {
    id: 'vine_boom',
    name: 'Vine Boom 808',
    category: 'Bass Punch',
    getAudio: () => generateVineBoomWav(),
    icon: '💥',
  },
  {
    id: 'level_up',
    name: 'Level Up 8-Bit',
    category: 'Game',
    getAudio: () => generateLevelUpWav(),
    icon: '⭐',
  },
  {
    id: 'victory',
    name: 'Tada Victory Fanfare',
    category: 'Chime',
    getAudio: () => generateVictoryWav(),
    icon: '🎉',
  },
  {
    id: 'coin',
    name: 'Retro Coin Collect',
    category: 'Retro',
    getAudio: () => generateCoinWav(),
    icon: '🪙',
  },
  {
    id: 'laser',
    name: 'Arcade Laser Zap',
    category: 'Action',
    getAudio: () => generateLaserWav(),
    icon: '⚡',
  },
  {
    id: 'alert',
    name: 'Warning Alarm Siren',
    category: 'Alert',
    getAudio: () => generateSirenWav(),
    icon: '🚨',
  },
];

interface CustomSound {
  id: string;
  name: string;
  url: string;
  size?: string;
  source: 'upload' | 'url' | 'preset';
}

export const AdminAudioApp: React.FC = () => {
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const [selectedSoundUrl, setSelectedSoundUrl] = useState<string>(() => SOUND_PRESETS[0].getAudio());
  const [selectedSoundName, setSelectedSoundName] = useState<string>(SOUND_PRESETS[0].name);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [soundTitleInput, setSoundTitleInput] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.85);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isPlayingLocal, setIsPlayingLocal] = useState<boolean>(false);
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastSoundEvent[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [adminSenderName, setAdminSenderName] = useState<string>('fastyjay (Admin)');
  const [onlineListeners, setOnlineListeners] = useState<number>(1);

  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to live online presence
  useEffect(() => {
    const unsub = audioBroadcast.subscribePresence((count) => {
      setOnlineListeners(count);
    });
    return () => unsub();
  }, []);

  // Load custom sounds from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calcplanet_custom_sounds');
      if (saved) {
        setCustomSounds(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveCustomSounds = (sounds: CustomSound[]) => {
    setCustomSounds(sounds);
    try {
      localStorage.setItem('calcplanet_custom_sounds', JSON.stringify(sounds));
    } catch {
      // Storage might exceed if user uploads big files
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setStatusMessage('⚠️ Please select a valid audio file (MP3, WAV, OGG, etc.)');
      return;
    }

    // Limit to 5MB for storage safety
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage('⚠️ File size is too large (max 5MB for instant client broadcasting).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const newSound: CustomSound = {
        id: `custom_${Date.now()}`,
        name: cleanName,
        url: base64Data,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        source: 'upload',
      };

      const updated = [newSound, ...customSounds];
      saveCustomSounds(updated);
      setSelectedSoundUrl(base64Data);
      setSelectedSoundName(cleanName);
      setStatusMessage(`✅ Imported "${cleanName}" successfully! Ready to broadcast.`);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  // Handle custom URL import
  const handleAddUrlSound = () => {
    if (!inputUrl.trim()) return;

    const name = soundTitleInput.trim() || `Web Audio (${new URL(inputUrl).pathname.split('/').pop() || 'Track'})`;
    const newSound: CustomSound = {
      id: `url_${Date.now()}`,
      name,
      url: inputUrl.trim(),
      source: 'url',
    };

    const updated = [newSound, ...customSounds];
    saveCustomSounds(updated);
    setSelectedSoundUrl(inputUrl.trim());
    setSelectedSoundName(name);
    setInputUrl('');
    setSoundTitleInput('');
    setStatusMessage(`✅ Added sound URL "${name}"!`);
  };

  // Preview sound locally
  const handleToggleLocalPreview = () => {
    if (isPlayingLocal && localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current.currentTime = 0;
      setIsPlayingLocal(false);
      return;
    }

    if (!selectedSoundUrl) {
      setStatusMessage('⚠️ Please select or upload a sound first.');
      return;
    }

    if (localAudioRef.current) {
      localAudioRef.current.pause();
    }

    const audio = new Audio(selectedSoundUrl);
    audio.volume = volume;
    localAudioRef.current = audio;

    audio.onended = () => {
      setIsPlayingLocal(false);
    };

    audio.onerror = () => {
      setIsPlayingLocal(false);
      setStatusMessage('❌ Error playing audio preview. The URL might be blocked or corrupt.');
    };

    audio.play()
      .then(() => {
        setIsPlayingLocal(true);
        setStatusMessage(`▶️ Previewing "${selectedSoundName}" locally.`);
      })
      .catch((err) => {
        setIsPlayingLocal(false);
        setStatusMessage(`❌ Playback blocked by browser: ${err.message}`);
      });
  };

  // Trigger LIVE GLOBAL BROADCAST to all connected visitors worldwide
  const handleBroadcastLive = async () => {
    if (!selectedSoundUrl) {
      setStatusMessage('⚠️ Select or import an audio track first.');
      return;
    }

    setIsBroadcasting(true);

    try {
      const result = await audioBroadcast.broadcastSound(
        selectedSoundName,
        selectedSoundUrl,
        volume,
        adminSenderName
      );

      const event = result.event;
      setBroadcastHistory((prev) => [event, ...prev.slice(0, 19)]);
      setStatusMessage(
        `🔴 GLOBAL BROADCAST SENT: "${selectedSoundName}" reached ${result.deliveredToCount} active visitor(s) @ ${(volume * 100).toFixed(0)}% volume!`
      );

      // Play local audio preview on admin machine too
      audioBroadcast.playSound(selectedSoundUrl, volume).catch(() => {});

      setTimeout(() => {
        setIsBroadcasting(false);
      }, 1200);
    } catch (e) {
      setIsBroadcasting(false);
      setStatusMessage('❌ Failed to dispatch broadcast event to server.');
    }
  };

  const handleDeleteCustomSound = (id: string) => {
    const updated = customSounds.filter((s) => s.id !== id);
    saveCustomSounds(updated);
    if (selectedSoundUrl === customSounds.find((s) => s.id === id)?.url) {
      setSelectedSoundUrl(SOUND_PRESETS[0].getAudio());
      setSelectedSoundName(SOUND_PRESETS[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      <ParticleBackground theme="cosmic-dark" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-indigo-500/20 bg-[#090b10]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 p-[2px] shadow-lg shadow-rose-500/30">
              <div className="w-full h-full bg-[#0d111c] rounded-[14px] flex items-center justify-center">
                <RadioTower className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-fredoka text-2xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                  CalcPlanet Audio Dispatch
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">Live Global Sound Broadcaster (fastyjay.html)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{onlineListeners} Worldwide Client{onlineListeners === 1 ? '' : 's'} Online</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Main Site</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Status Toast Message */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-sm font-semibold text-indigo-200 flex items-center justify-between backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button 
              onClick={() => setStatusMessage('')}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Broadcast Deck (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Master Broadcaster Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141a33] via-[#0f1426] to-[#0a0d18] border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Currently Loaded Track */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090c16]/80 border border-slate-800 backdrop-blur-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 p-[1.5px] shrink-0">
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                        <Music className="w-6 h-6 text-indigo-300" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ready for Broadcast</span>
                      <h3 className="font-fredoka text-lg font-bold text-white truncate">{selectedSoundName}</h3>
                    </div>
                  </div>

                  {/* Local Preview Toggle */}
                  <button
                    onClick={handleToggleLocalPreview}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isPlayingLocal
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    {isPlayingLocal ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Test</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Test Preview</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Volume & Admin Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Volume Slider */}
                  <div className="p-4 rounded-2xl bg-[#090c16]/60 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <span>Broadcast Volume</span>
                      </div>
                      <span className="text-cyan-300 font-bold">{(volume * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Sender Tag */}
                  <div className="p-4 rounded-2xl bg-[#090c16]/60 border border-slate-800/80 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">Sender Name</label>
                    <input
                      type="text"
                      value={adminSenderName}
                      onChange={(e) => setAdminSenderName(e.target.value)}
                      placeholder="Admin"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                </div>

                {/* BIG RED BROADCAST TRIGGER BUTTON */}
                <button
                  onClick={handleBroadcastLive}
                  disabled={isBroadcasting}
                  className={`w-full py-5 rounded-2xl font-fredoka text-xl font-bold text-white shadow-2xl flex items-center justify-center gap-3 border transition-all cursor-pointer ${
                    isBroadcasting
                      ? 'bg-rose-700 border-rose-400 scale-[0.98] shadow-rose-600/50 animate-pulse'
                      : 'bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:brightness-110 border-rose-400/40 shadow-rose-600/40 hover:shadow-rose-600/60'
                  }`}
                >
                  <Radio className={`w-7 h-7 ${isBroadcasting ? 'animate-spin' : 'animate-pulse'}`} />
                  <span>{isBroadcasting ? 'BROADCASTING AUDIO LIVE...' : '🔴 BROADCAST SOUND TO EVERYONE'}</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Transmits audio immediately to all open tabs and active visitors on the domain.
                </p>

              </div>
            </div>

            {/* Custom Audio Importer / Uploader */}
            <div className="p-6 rounded-3xl bg-[#0e1322] border border-indigo-500/20 space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-fredoka text-lg font-bold text-white">Import Custom Audio</h3>
                </div>
                <span className="text-xs text-slate-400">MP3, WAV, OGG, M4A</span>
              </div>

              {/* Upload Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <FileAudio className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Click to Upload Audio File from your computer</p>
                <p className="text-xs text-slate-400">Audio will be loaded into browser memory for instant streaming</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Or Import via URL */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Or Paste Audio URL</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={soundTitleInput}
                    onChange={(e) => setSoundTitleInput(e.target.value)}
                    placeholder="Sound Title (e.g. Vine Boom)"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/sound.mp3"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddUrlSound}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Soundboard Library & Broadcast History (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Soundboard Presets */}
            <div className="p-6 rounded-3xl bg-[#0e1322] border border-indigo-500/20 space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-fredoka text-lg font-bold text-white">Preset Soundboard</h3>
                </div>
                <span className="text-xs text-slate-400">{SOUND_PRESETS.length} Instant Sounds</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {SOUND_PRESETS.map((preset) => {
                  const isSelected = selectedSoundName === preset.name;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const audioUri = preset.getAudio();
                        setSelectedSoundUrl(audioUri);
                        setSelectedSoundName(preset.name);
                        setStatusMessage(`Selected "${preset.name}". Ready to broadcast!`);
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-indigo-400 shadow-md shadow-indigo-500/20 text-white'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{preset.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-fredoka text-xs font-bold truncate block">{preset.name}</span>
                        <span className="text-[10px] text-slate-400 block">{preset.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Custom Saved Sounds */}
            {customSounds.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#0e1322] border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-fredoka text-lg font-bold text-white">My Imported Sounds</h3>
                  </div>
                  <span className="text-xs text-slate-400">{customSounds.length} Tracks</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {customSounds.map((sound) => (
                    <div
                      key={sound.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        selectedSoundUrl === sound.url
                          ? 'bg-indigo-600/25 border-indigo-400 text-white'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div
                        onClick={() => {
                          setSelectedSoundUrl(sound.url);
                          setSelectedSoundName(sound.name);
                        }}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="font-fredoka text-xs font-bold truncate">{sound.name}</p>
                        <span className="text-[10px] text-slate-400 uppercase">{sound.source} {sound.size ? `• ${sound.size}` : ''}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteCustomSound(sound.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove sound"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broadcast Transmission Log */}
            <div className="p-6 rounded-3xl bg-[#0e1322] border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-400" />
                  <h3 className="font-fredoka text-lg font-bold text-white">Live Transmission Log</h3>
                </div>
                <span className="text-xs text-slate-400">{broadcastHistory.length} Dispatched</span>
              </div>

              {broadcastHistory.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {broadcastHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-indigo-300 truncate block">{item.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString()} • Vol: {(item.volume * 100).toFixed(0)}%
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          audioBroadcast.broadcastSound(item.title, item.audioData, item.volume, item.sender);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white font-semibold text-[10px] transition-colors cursor-pointer"
                      >
                        Re-Broadcast
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                  No sounds broadcasted in this session yet. Click the red button to send a live sound.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Informational Guidance on Web Autoplay Restrictions */}
        <div className="mt-8 p-5 rounded-2xl bg-[#0f1424] border border-indigo-500/20 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>How Live Audio Broadcasting Works on Modern Browsers</span>
          </div>
          <p>
            • <strong>Instant Tab Synchronization</strong>: When you click Broadcast, the audio event is immediately transmitted across every active CalcPlanet tab and browser window on the domain in real-time.
          </p>
          <p>
            • <strong>Browser Autoplay Security</strong>: Web browsers (Chrome, Safari, Edge) require visitors to click or tap the page at least once to unlock audio playback. CalcPlanet displays a notification and auto-unlocks whenever visitors interact with the site.
          </p>
        </div>

      </main>
    </div>
  );
};

const rootElement = document.getElementById('admin-root');
if (rootElement) {
  createRoot(rootElement).render(<AdminAudioApp />);
}
