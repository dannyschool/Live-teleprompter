import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Script, AppSettings } from '../types';
import { Icons } from '../components/Icon';
import { saveSettings, getSettings } from '../services/storageService';

interface PrompterProps {
  script: Script;
  onClose: () => void;
}

// Helper to format seconds into MM:SS
const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const Prompter: React.FC<PrompterProps> = ({ script, onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Stats
  const [totalTime, setTotalTime] = useState("00:00");
  const [remainingTime, setRemainingTime] = useState("00:00");
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Scrolling Logic Refs
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const preciseScrollRef = useRef<number>(0); // Tracks sub-pixel scroll position

  // Hide controls automatically after inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
        setShowControls(true);
        clearTimeout(timeout);
        if (isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    
    resetTimer();

    return () => {
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('touchstart', resetTimer);
        clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Animation Loop
  const animate = useCallback((time: number) => {
    if (!isPlaying || !scrollContainerRef.current) return;

    const deltaTime = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    // Calculate speed. 
    // Heuristic: Speed 50 ~= 75px/second. Adjust multiplier (1.5) as needed.
    const pixelsPerSecond = settings.scrollSpeed * 1.5; 
    
    if (deltaTime > 0) {
        const move = (pixelsPerSecond * deltaTime) / 1000;
        preciseScrollRef.current += move;
        scrollContainerRef.current.scrollTop = preciseScrollRef.current;
    }

    // Check if reached bottom
    // We allow a 1px buffer for browser rounding differences
    const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
    if (preciseScrollRef.current >= maxScroll - 1) {
        setIsPlaying(false);
        return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, settings.scrollSpeed]);

  // Start/Stop Animation
  useEffect(() => {
    if (isPlaying) {
        if (scrollContainerRef.current) {
            // Sync precise ref with current DOM position to handle manual scrolling while paused
            preciseScrollRef.current = scrollContainerRef.current.scrollTop;
        }
        lastFrameTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
    } else {
        cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, animate]);

  // Update Time Stats Interval
  useEffect(() => {
    const updateStats = () => {
        if (!scrollContainerRef.current) return;
        
        const scroller = scrollContainerRef.current;
        const maxScroll = scroller.scrollHeight - scroller.clientHeight;
        const currentScroll = scroller.scrollTop;
        
        // Avoid division by zero
        const speed = Math.max(0.1, settings.scrollSpeed * 1.5);
        
        const totalSeconds = maxScroll / speed;
        const remainingSeconds = Math.max(0, (maxScroll - currentScroll) / speed);
        
        setTotalTime(formatTime(totalSeconds));
        setRemainingTime(formatTime(remainingSeconds));
    };

    // Update immediately and then on interval
    updateStats();
    const interval = setInterval(updateStats, 500);
    return () => clearInterval(interval);
  }, [settings.scrollSpeed, script.content, isPlaying]); // Re-calc if speed or content changes

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className={`relative h-full w-full overflow-hidden transition-colors duration-300 ${settings.isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* Time HUD */}
      <div className="absolute top-4 right-4 z-30 flex gap-2 pointer-events-none select-none">
        <div className="bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
            <span className="text-gray-400 mr-1">Total:</span> 
            <span className="font-mono font-medium">{totalTime}</span>
        </div>
        <div className={`${isPlaying ? 'bg-green-900/80' : 'bg-gray-900/80'} text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 shadow-sm transition-colors`}>
            <span className="text-gray-400 mr-1">Left:</span> 
            <span className="font-mono font-medium">{remainingTime}</span>
        </div>
      </div>

      {/* Eye Line Marker */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 z-10 pointer-events-none flex items-center">
         <div className="w-full border-t-2 border-red-500 opacity-30 border-dashed"></div>
         <div className="absolute left-0 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-r-sm text-white opacity-60 font-bold tracking-wider">EYE LINE</div>
      </div>

      {/* Scroll Content */}
      <div 
        ref={scrollContainerRef}
        className={`h-full overflow-y-scroll no-scrollbar px-4 py-[50vh]`}
        style={{ scrollBehavior: 'auto' }}
      >
        <div 
            style={{ 
                fontSize: `${settings.fontSize}px`,
                paddingLeft: `${settings.paddingX}%`,
                paddingRight: `${settings.paddingX}%`,
                transform: settings.isMirrored ? 'scaleX(-1)' : 'none',
                lineHeight: 1.6
            }}
            className="text-center font-sans font-medium outline-none"
        >
            {script.content.split('\n').map((line, i) => (
                <p key={i} className="mb-[0.5em] whitespace-pre-wrap min-h-[1em]">{line || ' '}</p>
            ))}
        </div>
      </div>

      {/* Overlay Controls */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent pt-12 pb-8 px-6 transition-opacity duration-300 flex flex-col gap-5 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Sliders Row */}
        <div className="grid gap-4 max-w-xl mx-auto w-full">
             {/* Speed Control */}
            <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-xl border border-white/10">
                <span className="text-xs uppercase tracking-wider text-gray-400 w-10 font-bold pl-2">Spd</span>
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={settings.scrollSpeed} 
                    onChange={(e) => setSettings({...settings, scrollSpeed: parseInt(e.target.value)})}
                    className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-indigo-400"
                />
                <span className="text-xs font-mono w-8 text-right text-white">{settings.scrollSpeed}</span>
            </div>

            {/* Font Size Control */}
            <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-xl border border-white/10">
                <span className="text-xs uppercase tracking-wider text-gray-400 w-10 font-bold pl-2">Size</span>
                <input 
                    type="range" 
                    min="20" 
                    max="150" 
                    value={settings.fontSize} 
                    onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})}
                    className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
                />
                <span className="text-xs font-mono w-8 text-right text-white">{settings.fontSize}</span>
            </div>
        </div>

        {/* Buttons Row */}
        <div className="flex justify-between items-center max-w-xl mx-auto w-full mt-2">
            <button onClick={onClose} className="p-4 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-transform active:scale-95 border border-white/10">
                <Icons.ChevronLeft />
            </button>

            <button 
                onClick={togglePlay}
                className={`p-5 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'} text-white shadow-xl transform active:scale-95 transition-all flex items-center justify-center`}
            >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>

            <div className="flex gap-3">
                 {/* Theme Toggle (Local override for prompter) */}
                <button 
                    onClick={() => setSettings({...settings, isDarkMode: !settings.isDarkMode})}
                    className="p-4 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm border border-white/10"
                    title="Toggle Theme"
                >
                    {settings.isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                </button>

                <button 
                    onClick={() => setSettings({...settings, isMirrored: !settings.isMirrored})}
                    className={`p-4 rounded-full backdrop-blur-sm border border-white/10 transition-colors ${settings.isMirrored ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-400'}`}
                    title="Mirror Text"
                >
                    <span className="font-bold text-lg leading-none block transform scale-x-[-1]">R</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};