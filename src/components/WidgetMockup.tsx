import { useState, useEffect } from 'react';

/**
 * Mockup of the GaiaAlarm home screen widget.
 * Shows current time, next alarm, label, and Snooze button.
 * IMPORTANT: No advertising content in the widget.
 */
export default function WidgetMockup() {
  const [time, setTime] = useState(new Date());
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const is24Hour = true;
  const hours = is24Hour ? time.getHours() : time.getHours() % 12 || 12;
  const minutes = time.getMinutes();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <div className="relative">
      {/* Home screen background */}
      <div className="relative w-[340px] h-[340px] rounded-3xl bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 p-6 overflow-hidden shadow-2xl">
        {/* Decorative wallpaper circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl"></div>

        {/* Widget */}
        <div className="relative h-full w-full rounded-[28px] bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 p-5 flex flex-col shadow-2xl">
          {/* Widget top bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-md">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2 2" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">GaiaAlarm Widget</span>
          </div>

          {/* Current time */}
          <div className="text-white font-bold text-[56px] leading-none tracking-tight tabular-nums">
            {timeStr}
          </div>

          {/* Next alarm info */}
          <div className="mt-3 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
            </svg>
            <span className="text-xs font-medium text-cyan-300">
              {snoozed ? 'Snoozed until ' : 'Next alarm: '}
              <span className="text-white font-bold">{snoozed ? '07:40' : '07:30'}</span>
            </span>
          </div>

          {/* Label */}
          <div className="mt-1 text-xs text-white/60 truncate">
            🌅 Wake up!
          </div>

          {/* Snooze button */}
          <button
            onClick={() => {
              setSnoozed(true);
              setTimeout(() => setSnoozed(false), 4000);
            }}
            className="mt-auto self-end px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors backdrop-blur-sm"
          >
            💤 Snooze 10m
          </button>
        </div>
      </div>

      {/* "No ads" badge */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-slate-900 flex items-center gap-1">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
        </svg>
        AD-FREE
      </div>
    </div>
  );
}
