import { useState, useEffect } from 'react';

/**
 * Animated Android phone mockup that displays the GaiaAlarm MainActivity
 * with TimePicker, alarm label, vibration switch, Set/Cancel buttons,
 * and the Yandex Mobile Ads banner at the bottom.
 */
export default function PhoneMockup() {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [label, setLabel] = useState('Wake up!');
  const [vibrate, setVibrate] = useState(true);
  const [alarmSet, setAlarmSet] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSet = () => setAlarmSet(true);
  const handleCancel = () => setAlarmSet(false);

  return (
    <div className="flex items-center justify-center">
      {/* Phone frame */}
      <div className="relative w-[340px] h-[700px] rounded-[44px] bg-slate-900 p-3 shadow-[0_0_60px_rgba(6,182,212,0.15)] border-4 border-slate-800">
        {/* Screen */}
        <div className="relative w-full h-full rounded-[32px] bg-gradient-to-b from-[#f5f7fb] to-[#e8ecf3] overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium text-slate-800">
            <span>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M1 6h2v3H1zM5 4h2v5H5zM9 2h2v7H9zM13 0h1v9h-1z" /></svg>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><rect x="1" y="2" width="10" height="6" rx="1" /><rect x="2" y="3" width="8" height="4" rx="0.5" /></svg>
              <svg width="22" height="10" viewBox="0 0 22 10" fill="currentColor"><rect x="0.5" y="0.5" width="18" height="9" rx="2" fill="none" stroke="currentColor" /><rect x="2" y="2" width="15" height="6" rx="1" /><path d="M20 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2 2M5 3L2 6M19 3l3 3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">GaiaAlarm</h2>
              {alarmSet && (
                <span className="ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 space-y-4 overflow-y-auto">
            {/* TimePicker visual */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Alarm Time
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setHour((h) => (h + 1) % 24)}
                    className="w-16 h-6 text-slate-400 hover:text-slate-700"
                  >
                    ▲
                  </button>
                  <div className="w-16 h-14 rounded-xl bg-gradient-to-b from-cyan-50 to-emerald-50 border border-cyan-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800 tabular-nums">
                      {String(hour).padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    onClick={() => setHour((h) => (h - 1 + 24) % 24)}
                    className="w-16 h-6 text-slate-400 hover:text-slate-700"
                  >
                    ▼
                  </button>
                </div>
                <span className="text-3xl font-bold text-slate-300 mt-0">:</span>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setMinute((m) => (m + 1) % 60)}
                    className="w-16 h-6 text-slate-400 hover:text-slate-700"
                  >
                    ▲
                  </button>
                  <div className="w-16 h-14 rounded-xl bg-gradient-to-b from-cyan-50 to-emerald-50 border border-cyan-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800 tabular-nums">
                      {String(minute).padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    onClick={() => setMinute((m) => (m - 1 + 60) % 60)}
                    className="w-16 h-6 text-slate-400 hover:text-slate-700"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>

            {/* Label input */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Label
              </p>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-transparent text-base text-slate-800 font-medium outline-none placeholder-slate-300"
                placeholder="Alarm label"
              />
              <div className="h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full mt-1"></div>
            </div>

            {/* Vibration switch */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Vibrate</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Enable vibration with alarm</p>
              </div>
              <button
                onClick={() => setVibrate(!vibrate)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  vibrate ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    vibrate ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleSet}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
              >
                ⏰ Set Alarm
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm active:scale-95 transition-transform"
              >
                ✕ Cancel Alarm
              </button>
            </div>

            {/* Yandex Ad Banner — ONLY in main activity */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-dashed border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-slate-800 text-white text-[8px] font-bold uppercase">
                  Ad
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Yandex Mobile Ads</p>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white text-lg">
                  🔔
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-700 truncate">Premium Alarm Sounds</p>
                  <p className="text-[10px] text-slate-500 truncate">Download now · Free</p>
                </div>
                <button className="px-3 py-1 rounded-md bg-slate-800 text-white text-[10px] font-bold">
                  GET
                </button>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="h-1 bg-black/10 mx-16 rounded-full mb-2"></div>
        </div>
      </div>
    </div>
  );
}
