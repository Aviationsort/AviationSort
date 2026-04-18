import React from 'react';
import { List, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';

// Types and Interfaces remain the same
type GuiStyle = 'sw950' | 'de330' | 'd145' | 'exp3361' | 'cd566' | 'd901nv' | 'd421sp';

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
  const [dbbEnabled, setDbbEnabled] = React.useState(false);
  
  return (
    <>
      {/* Style Selector with Glossy Glassmorphism */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
        {(['sw950', 'de330', 'd145', 'exp3361', 'cd566', 'd901nv', 'd421sp'] as GuiStyle[]).map((style) => (
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

            {/* Top Branding - AviationSort */}
            <div className="mt-6 flex flex-col items-center z-10">
              <span className="text-[10px] font-black tracking-[0.3em] text-zinc-700 uppercase">AviationSort</span>
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
              <div className={`sw-lcd-circle ${isPlaying ? 'animate-pulse' : ''}`}>
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
        <div className="de330-body">
          <div className="de330-lid">

            {/* AviationSort Branding Top Center */}
            <div className="absolute top-12 w-full flex flex-col items-center">
              <span className="text-zinc-600 font-bold tracking-[0.2em] text-sm italic">AviationSort</span>
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
            <span className="text-white font-black italic text-sm tracking-tighter">AviationSort</span>
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
      {/* Glossy early 2000s tech-white and transparent blue accents - Expanium style */}
      {guiStyle === 'exp3361' && (
        <div className="cd-player-exp3361 relative w-96 h-96 rounded-full flex items-center justify-center p-4">
          {/* Outer Translucent Blue Shell */}
          <div className="exp3361-shell absolute inset-0 rounded-full border-4 border-blue-800 shadow-2xl"
               style={{
                 background: 'radial-gradient(circle, rgba(30,58,138,0.8) 0%, rgba(23,37,84,1) 100%)',
                 boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.3)'
               }}>
            
            {/* Inner Silver/Checkered Faceplate */}
            <div className="exp3361-faceplate absolute w-[88%] h-[88%] top-[6%] left-[6%] rounded-full border-2 border-slate-400 overflow-hidden"
                 style={{
                   backgroundColor: '#ccc',
                   backgroundImage: `
                     linear-gradient(45deg, #bbb 25%, transparent 25%), 
                     linear-gradient(-45deg, #bbb 25%, transparent 25%), 
                     linear-gradient(45deg, transparent 75%, #bbb 75%), 
                     linear-gradient(-45deg, transparent 75%, #bbb 75%)`,
                   backgroundSize: '8px 8px',
                   backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                 }}>
              
              {/* LCD Display Area (The "Expanium" Hub) */}
              <div className="exp3361-lcd-hub absolute top-10 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-slate-300 border-[6px] border-slate-400 shadow-inner flex flex-col items-center pt-8">
                {/* Buttons around LCD */}
                <div className="exp3361-lcd-buttons absolute -top-1 w-full flex justify-between px-2 text-[8px] font-bold text-slate-600">
                  <span>ESP</span>
                  <span>PROG</span>
                  <span>DISPLAY</span>
                  <span>MODE</span>
                </div>

                {/* Actual LCD Screen */}
                <div className="exp3361-lcd-screen w-24 h-12 bg-[#c5ccb8] border-2 border-slate-500 rounded-sm shadow-inner flex flex-col items-center justify-center overflow-hidden">
                   <div className="text-[10px] font-mono text-slate-800 opacity-70">MP3-CD PLAYBACK</div>
                   <div className="text-xl font-bold font-mono tracking-tighter text-slate-900">{isPlaying ? (currentTrack?.id || '01') : 'MP3'}</div>
                   <div className="text-xs font-mono text-slate-600">{formatTime(currentTime)}</div>
                </div>
                
                <div className="mt-2 text-[10px] font-black italic tracking-widest text-slate-700">EXPANIUM</div>
              </div>

              {/* D-Pad / Play Controls */}
              <div className="exp3361-controls absolute bottom-24 left-10 w-28 h-28 rounded-full bg-slate-300 border-4 border-slate-400 shadow-lg flex items-center justify-center">
                <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2">
                  <button onClick={playPrev} className="text-slate-600 text-xs flex items-center justify-center hover:text-blue-900">⏮</button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-400 flex items-center justify-center shadow-sm cursor-pointer active:scale-95 hover:bg-blue-50">
                    <span className="text-lg">{isPlaying ? '⏸' : '▶'}</span>
                  </button>
                  <button onClick={playNext} className="text-slate-600 text-xs flex items-center justify-center hover:text-blue-900">⏭</button>
                </div>
              </div>

              {/* DBB Button (Dynamic Bass Boost) */}
              <div className="exp3361-dbb absolute bottom-32 left-44 flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full border-2 border-slate-500 shadow-inner flex items-center justify-center cursor-pointer ${dbbEnabled ? 'bg-blue-600' : 'bg-slate-400'}`} onClick={() => setDbbEnabled(!dbbEnabled)}>
                  <div className={`w-1.5 h-1.5 rounded-full ${dbbEnabled ? 'bg-white' : 'bg-slate-600'}`}></div>
                </div>
                <span className="text-[6px] font-bold text-slate-700 mt-1 uppercase leading-none text-center">Dynamic<br/>Bass Boost</span>
              </div>

              {/* Branding at bottom */}
              <div className="exp3361-branding absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <h1 className="text-2xl font-black tracking-tighter text-blue-900 opacity-80">AVIATIONSORT</h1>
                <p className="text-[7px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
                  200 Sec Magic Electronic Skip Protection
                </p>
              </div>
            </div>
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
              <h3 className="text-zinc-200 font-black tracking-[0.3em] text-xs">AviationSort</h3>
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

      {/* --- SONY D-901 NV --- */}
      {/* Sleek late 90s/early 2000s "NV" series with metallic finish and blue accents */}
      {guiStyle === 'd901nv' && (
        <div className="d901nv-player-outer relative w-80 h-80 rounded-[40px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-[10px_10px_30px_rgba(0,0,0,0.5),inset_2px_2px_10px_rgba(255,255,255,0.1)] border-4 border-slate-600 flex flex-col items-center p-6">
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-blue-400 font-black text-lg italic tracking-tighter">AviationSort</span>
            <span className="text-slate-400 font-mono text-[10px]">Discman D-901NV</span>
          </div>

          <div className="w-full bg-slate-900/80 rounded-2xl p-4 border border-slate-700 shadow-inner flex justify-between items-center mb-4">
             <div className="text-cyan-400 font-mono text-3xl drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
               {currentTrack ? String(currentTrackIndex + 1).padStart(2, '0') : '--'}
             </div>
             <div className="h-10 w-px bg-slate-700" />
             <div className="text-blue-300 font-mono text-lg">
               {currentTrack ? formatTime(currentTime) : '00:00'}
             </div>
          </div>

          <div className="flex-1 w-full relative flex items-center justify-center mb-4">
            <div className={`w-40 h-40 rounded-full bg-gradient-to-tr from-slate-600 to-slate-800 shadow-xl border-4 border-slate-500 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
               <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-600 shadow-lg border-4 border-slate-700 flex items-center justify-center">
                 <Play className={`text-white w-12 h-12 fill-white ${isPlaying ? 'hidden' : 'block'}`} />
                 <Pause className={`text-white w-12 h-12 fill-white ${isPlaying ? 'block' : 'hidden'}`} />
               </div>
            </div>
          </div>

          <div className="w-full flex justify-around items-center mt-2">
             <button onClick={playPrev} className="text-cyan-400 hover:scale-110 transition-transform"><SkipBack /></button>
             <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 border-2 border-blue-300">
               {isPlaying ? <Pause className="fill-white" /> : <Play className="fill-white ml-1" />}
             </button>
             <button onClick={playNext} className="text-cyan-400 hover:scale-110 transition-transform"><SkipForward /></button>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[8px] font-bold text-slate-400">VOL</span>
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-slate-600 rounded-lg appearance-none accent-cyan-400"
            />
          </div>
        </div>
      )}

      {/* --- SONY D-421 SP --- */}
      {/* Compact early 2000s "SP" series with sporty design and orange/green accents */}
      {guiStyle === 'd421sp' && (
        <div className="d421sp-player-outer relative w-76 h-76 rounded-[48px] bg-gradient-to-br from-emerald-700 via-teal-800 to-teal-900 shadow-[10px_10px_30px_rgba(0,0,0,0.5),inset_2px_2px_10px_rgba(255,255,255,0.1)] border-4 border-teal-600 flex flex-col items-center p-6">
          <div className="w-full flex justify-between items-center mb-3">
            <span className="text-orange-400 font-black text-lg italic tracking-tighter">AviationSort</span>
            <span className="text-teal-300 font-mono text-[9px]">Discman D-421SP</span>
          </div>

          <div className="w-full bg-black/60 rounded-xl p-3 border-2 border-teal-600 shadow-inner flex justify-center items-center gap-6 mb-4">
             <div className="text-green-400 font-mono text-4xl drop-shadow-[0_0_6px_rgba(74,222,128,0.7)]">
               {currentTrack ? String(currentTrackIndex + 1).padStart(2, '0') : '--'}
             </div>
             <div className="text-teal-300 font-mono text-base">
               {currentTrack ? formatTime(currentTime) : '00:00'}
             </div>
          </div>

          <div className="flex-1 w-full relative flex items-center justify-center mb-3">
            <div className={`w-36 h-36 rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 shadow-xl border-4 border-teal-400 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
               <div className="w-8 h-8 rounded-full bg-teal-900 border-2 border-teal-300" />
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-3 mt-2">
             <button onClick={playPrev} className="h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 border-2 border-orange-300"><SkipBack className="fill-white w-5 h-5" /></button>
             <button onClick={() => setIsPlaying(!isPlaying)} className="h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 border-2 border-green-300">
               {isPlaying ? <Pause className="fill-white w-6 h-6" /> : <Play className="fill-white w-6 h-6 ml-1" />}
             </button>
             <button onClick={playNext} className="h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 border-2 border-orange-300"><SkipForward className="fill-white w-5 h-5" /></button>
          </div>
          
          <div className="mt-3 flex items-center gap-2 w-full justify-center">
            <span className="text-[8px] font-bold text-teal-300">VOLUME</span>
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-teal-600 rounded-lg appearance-none accent-green-400"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MusicModels;