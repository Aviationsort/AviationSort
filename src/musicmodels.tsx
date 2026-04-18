import React from 'react';
import { List, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';

// Types and Interfaces remain the same
type GuiStyle = 'sw950' | 'de330' | 'd145' | 'exp3361' | 'cd566';

interface Track {
  id: number;
  playlist_id: number;
  title: string;
  url: string;
  source: string;
  duration: number;
  thumbnail: string;
  added_at: string;
}

interface MusicModelsProps {
  guiStyle: GuiStyle;
  setGuiStyle: (style: GuiStyle) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: Track | undefined;
  currentTrackIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isHold: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
  eqHeights: number[];
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrev: () => void;
  setShowAddModal: (show: boolean) => void;
  setShowQueueModal: (show: boolean) => void;
  formatTime: (seconds: number) => string;
  t: { playlists: string; noPlaylists: string; };
}

const MusicModels: React.FC<MusicModelsProps> = ({
  guiStyle, setGuiStyle, isPlaying, setIsPlaying, currentTrack, currentTrackIndex,
  currentTime, duration, volume, isMuted, isHold, isShuffled, repeatMode, eqHeights,
  handleProgressClick, handleVolumeChange, toggleMute, toggleHold, toggleShuffle,
  toggleRepeat, playNext, playPrev, setShowAddModal, setShowQueueModal, formatTime
}) => {
  
  return (
    <>
      {/* Style Selector with Glossy Glassmorphism */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
        {(['sw950', 'de330', 'd145', 'exp3361', 'cd566'] as GuiStyle[]).map((style) => (
          <button
            key={style}
            onClick={() => setGuiStyle(style)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-inner ${
              guiStyle === style 
              ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' 
              : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'
            }`}
          >
            {style.replace(/([a-z])([0-9])/, '$1-$2')}
          </button>
        ))}
      </div>

      {/* --- PANASONIC SL-SW SHOCKWAVE --- */}
      {guiStyle === 'sw950' && (
        <div className="sw-body">
          <div className="sw-ridges" />
          <div className="sw-lid">
            <div className="sw-brick-texture" />

            {/* Top Branding */}
            <div className="mt-6 flex flex-col items-center z-10">
              <span className="text-[10px] font-black tracking-[0.3em] text-zinc-700 uppercase">Panasonic</span>
              <span className="text-[7px] font-bold text-zinc-600">PORTABLE CD PLAYER</span>
            </div>

            {/* ShockWave Logo */}
            <div className="mt-4 flex flex-col items-center z-10">
              <span className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[2px_2px_0px_#1e2a4a] leading-none">SW</span>
              <span className="text-[8px] font-black tracking-[0.4em] text-zinc-800 -mt-1">SHOCK WAVE</span>
            </div>

            {/* Main Control Interface Area */}
            <div className="relative mt-2 flex flex-col items-center w-full px-8 z-10">
              <div className="flex justify-between w-full mb-2">
                 <button onClick={playPrev} className="sw-btn-round"><SkipBack size={14} /></button>
                 <button onClick={playNext} className="sw-btn-round"><SkipForward size={14} /></button>
              </div>

              {/* Circular LCD */}
               <div className={`sw-lcd ${isPlaying ? 'pulse' : ''}`}>
                 <span className="text-[8px] font-bold">VOL {Math.round(volume * 100)}</span>
                 <span className="text-xl font-bold leading-none my-1">
                   {currentTrack ? String(currentTrackIndex + 1).padStart(2, '0') : 'NO'}
                 </span>
                 <span className="text-[10px]">{formatTime(currentTime)}</span>
              </div>

              <div className="flex justify-between w-full mt-2">
                 <button className="sw-btn-round bg-green-500/80 border-green-700 text-xs font-bold text-white">EQ</button>
                 <button onClick={() => setIsPlaying(!isPlaying)} className="sw-btn-round">
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                 </button>
              </div>
            </div>

            {/* Bottom Latch */}
            <div className="absolute bottom-4 w-32 h-10 bg-zinc-400 border-2 border-zinc-600 rounded-t-xl flex items-center justify-center shadow-inner">
              <span className="text-[8px] font-black text-zinc-800 tracking-widest uppercase">Open</span>
            </div>
          </div>
        </div>
      )}

      {/* --- SONY D-E330 DISCMAN --- */}
      {guiStyle === 'de330' && (
        <div className="de330-player-outer">
          <div className="de330-lid">

            {/* SONY Branding Top Center */}
            <div className="absolute top-12 w-full flex flex-col items-center">
              <span className="text-zinc-600 font-bold tracking-[0.2em] text-sm italic">SONY</span>
              <div className="h-[1px] w-12 bg-zinc-400 my-1"></div>
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest">CD COMPACT PLAYER D-E330</span>
            </div>

            {/* Control Island */}
            <div className="de330-control-island left-1/2 -translate-x-1/2">

              {/* LCD and Top Row Buttons */}
              <div className="flex items-center gap-4 mb-3">
                <button className="de330-btn text-[8px] font-bold">MODE</button>

                <div className="de330-lcd">
                  <span className="text-lg">
                    {isPlaying ? (currentTrackIndex + 1).toString().padStart(2, '0') : '00'}
                  </span>
                </div>

                <button className="de330-btn text-[8px] font-bold">PROG</button>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-6">
                <button onClick={playPrev} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                  <SkipBack size={20} fill="currentColor" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="de330-btn-play flex items-center justify-center text-blue-600 active:translate-y-1 active:shadow-none transition-all"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button onClick={playNext} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>

              {/* Volume wheel simulation at the bottom */}
              <div className="mt-2 flex items-center gap-2">
                 <span className="text-[7px] font-bold text-zinc-500">VOL</span>
                 <input
                   type="range"
                   min="0" max="1" step="0.01"
                   value={volume}
                   onChange={handleVolumeChange}
                   className="w-24 h-1 bg-zinc-300 rounded-lg appearance-none accent-zinc-500"
                 />
              </div>
            </div>

            {/* G-PROTECTION Logo (Bottom Left) */}
            <div className="absolute bottom-16 left-12">
              <span className="text-[10px] font-black text-zinc-400 italic">G-PROTECTION</span>
            </div>
          </div>
        </div>
      )}

      {/* --- SONY DISCMAN D-145 --- */}
      {/* Classic 90s boxy "Discman" design with the iconic rectangular LCD */}
      {guiStyle === 'd145' && (
        <div className="d145-player-outer relative w-80 h-84 bg-zinc-800 rounded-3xl shadow-[5px_5px_15px_#000,-2px_-2px_10px_#444] border-t border-zinc-600 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 text-xs font-bold tracking-[0.2em]">DIGITAL AUDIO</span>
            <span className="text-white font-black italic text-sm tracking-tighter">Discman</span>
          </div>

          <div className="bg-[#2a302a] border-2 border-zinc-900 rounded-sm p-3 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] mb-6">
            <div className="font-mono text-[#78a078] flex justify-around items-center">
              <div className="text-4xl drop-shadow-[0_0_2px_#78a078]">
                {currentTrack ? String(currentTrackIndex + 1).padStart(2, '0') : '00'}
              </div>
              <div className="text-xl opacity-80">
                {currentTrack ? formatTime(currentTime) : '00:00'}
              </div>
            </div>
          </div>

          <div className="relative h-32 bg-zinc-900 rounded-full border-4 border-zinc-700 flex items-center justify-center overflow-hidden mb-6">
            <div className={`w-28 h-28 border-2 border-dashed border-zinc-700 rounded-full ${isPlaying ? 'animate-spin' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="flex justify-between items-center">
            <button onClick={toggleRepeat} className="text-[10px] text-zinc-500 font-bold border border-zinc-700 px-2 py-1 rounded hover:bg-zinc-700">REPLAY</button>
            <div className="flex gap-2">
              <button onClick={playPrev} className="p-2 bg-zinc-700 rounded shadow-md active:bg-zinc-900"><SkipBack className="w-4 h-4 text-white" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 py-2 bg-zinc-200 rounded shadow-md active:bg-zinc-400 text-black font-bold">
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button onClick={playNext} className="p-2 bg-zinc-700 rounded shadow-md active:bg-zinc-900"><SkipForward className="w-4 h-4 text-white" /></button>
            </div>
          </div>
        </div>
      )}

      {/* --- PHILIPS EXP3361 --- */}
      {/* Glossy early 2000s tech-white and transparent blue accents */}
      {guiStyle === 'exp3361' && (
        <div className="exp3361-player-outer relative w-80 h-80 rounded-[50px] bg-zinc-100 shadow-[10px_10px_30px_rgba(0,0,0,0.2),inset_-2px_-2px_10px_#fff] border-b-8 border-zinc-300 flex flex-col items-center p-6">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-blue-600 font-black text-xl italic tracking-tighter">Philips</span>
            <span className="text-zinc-400 font-mono text-[10px]">eXpanium</span>
          </div>

          <div className="w-full bg-blue-500/10 rounded-3xl p-4 border border-blue-200 shadow-inner flex justify-center items-center gap-4 mb-4">
             <div className="text-blue-600 font-mono text-4xl">
               {currentTrack ? String(currentTrackIndex + 1).padStart(2, '0') : '--'}
             </div>
             <div className="h-8 w-px bg-blue-200" />
             <div className="text-blue-400 font-mono text-lg">
               {currentTrack ? formatTime(currentTime) : '00:00'}
             </div>
          </div>

          <div className="flex-1 w-full relative flex items-center justify-center">
            <div className={`w-36 h-36 rounded-full bg-white border-2 border-blue-100 shadow-xl flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
               <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 shadow-lg border-4 border-white flex items-center justify-center">
                 <Play className={`text-white w-10 h-10 fill-white ${isPlaying ? 'hidden' : 'block'}`} />
                 <Pause className={`text-white w-10 h-10 fill-white ${isPlaying ? 'block' : 'hidden'}`} />
               </div>
            </div>
          </div>

          <div className="w-full flex justify-around mt-4">
             <button onClick={playPrev} className="text-blue-600 hover:scale-110 transition-transform"><SkipBack /></button>
             <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95"><Play className="fill-white" /></button>
             <button onClick={playNext} className="text-blue-600 hover:scale-110 transition-transform"><SkipForward /></button>
          </div>
        </div>
      )}

      {/* --- DURABRAND CD-566 --- */}
      {/* Budget skeuomorphic design - dark gray with bright green digital text */}
      {guiStyle === 'cd566' && (
        <div className="cd566-player-outer relative w-80 h-80 rounded-[60px] bg-zinc-600 shadow-2xl border-4 border-zinc-500 overflow-hidden">
          <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
          
          <div className="relative z-10 p-8 flex flex-col h-full">
            <div className="text-center mb-4">
              <h3 className="text-zinc-200 font-black tracking-[0.3em] text-xs">DURABRAND</h3>
            </div>

            <div className="bg-black/80 rounded border-2 border-zinc-700 p-4 mb-6 shadow-inner">
               <div className="flex justify-between text-[10px] text-green-500 font-mono mb-2">
                 <span>{isPlaying ? 'PLAYING' : 'READY'}</span>
                 <span>ESP 40SEC</span>
               </div>
               <div className="text-green-400 font-mono text-4xl text-center drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                 {currentTrack ? String(currentTrackIndex + 1).padStart(2, '0') : '00'} : {currentTrack ? formatTime(currentTime).split(':')[1] : '00'}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-auto">
               <button onClick={playPrev} className="bg-zinc-500 h-12 rounded-full border-b-4 border-zinc-800 flex justify-center items-center active:border-b-0 active:translate-y-1"><SkipBack className="text-white fill-white w-4 h-4" /></button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="bg-zinc-400 h-12 rounded-full border-b-4 border-zinc-700 flex justify-center items-center active:border-b-0 active:translate-y-1">
                 {isPlaying ? <Pause className="text-black fill-black" /> : <Play className="text-black fill-black ml-1" />}
               </button>
               <button onClick={playNext} className="bg-zinc-500 h-12 rounded-full border-b-4 border-zinc-800 flex justify-center items-center active:border-b-0 active:translate-y-1"><SkipForward className="text-white fill-white w-4 h-4" /></button>
            </div>
            
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-[10px] text-zinc-400 font-bold tracking-widest hover:text-white uppercase">Open Tray</button>
          </div>
        </div>
      )}
    </>
  );
};

export default MusicModels;