import { useState } from 'react';
import type { CodeFile } from '../data/codeFiles';

interface Props {
  files: CodeFile[];
}

const langColors: Record<string, string> = {
  kotlin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  xml: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  gradle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const langLabels: Record<string, string> = {
  kotlin: 'Kotlin',
  xml: 'XML',
  gradle: 'Gradle',
};

// Simple syntax highlighting for Kotlin
function highlightKotlin(code: string) {
  const keywords = /\b(package|import|class|object|interface|fun|val|var|const|override|private|public|protected|internal|companion|return|if|else|when|is|in|for|while|do|break|continue|throw|try|catch|finally|null|true|false|this|super|new|as|typeof|typeof|typeof)\b/g;
  const types = /\b(String|Int|Long|Boolean|Double|Float|Short|Byte|Char|Array|List|Map|Set|MutableList|MutableMap|Calendar|Context|Intent|PendingIntent|AlarmManager|LiveData|ViewModel|AndroidViewModel|SharedPreferences|Bundle|NotificationCompat|NotificationChannel|NotificationManager|RemoteViews|AppWidgetManager|AppWidgetProvider|BroadcastReceiver|Application|MaterialButton|TimePicker|Ringtone|Vibrator|VibratorManager)\b/g;
  const strings = /("[^"]*"|'[^']*')/g;
  const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const numbers = /\b(\d+[lLfFdD]?|0x[0-9a-fA-F]+)\b/g;
  const annotations = /@[\w.]+/g;

  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let result = escape(code);
  result = result.replace(comments, '<span class="text-slate-500 italic">$1</span>');
  result = result.replace(annotations, '<span class="text-yellow-400">$1</span>');
  result = result.replace(strings, '<span class="text-emerald-400">$1</span>');
  result = result.replace(keywords, '<span class="text-violet-400">$1</span>');
  result = result.replace(types, '<span class="text-cyan-400">$1</span>');
  result = result.replace(numbers, '<span class="text-amber-300">$1</span>');

  return result;
}

function highlightXML(code: string) {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let result = escape(code);
  result = result.replace(/(&quot;[^&]*&quot;)/g, '<span class="text-emerald-400">$1</span>');
  result = result.replace(/(&lt;\/?[\w.]+)/g, '<span class="text-cyan-400">$1</span>');
  result = result.replace(/(\/&gt;|&gt;)/g, '<span class="text-cyan-400">$1</span>');
  result = result.replace(/(\w+?)=/g, '<span class="text-violet-400">$1</span>=');
  result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-500 italic">$1</span>');
  return result;
}

function highlightGradle(code: string) {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let result = escape(code);
  result = result.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>');
  result = result.replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>');
  result = result.replace(/\b(implementation|api|compileOnly|testImplementation|androidTestImplementation|plugins|dependencies|android|defaultConfig|buildTypes|buildFeatures|compileOptions|kotlinOptions|namespace|minSdk|targetSdk|compileSdk|applicationId|versionCode|versionName|isMinifyEnabled|proguardFiles|getDefaultProguardFile)\b/g, '<span class="text-violet-400">$1</span>');
  result = result.replace(/\b(release|debug|id|com\.android\.application|org\.jetbrains\.kotlin\.android)\b/g, '<span class="text-cyan-400">$1</span>');
  return result;
}

export default function CodeViewer({ files }: Props) {
  const [activeId, setActiveId] = useState(files[0]?.id ?? '');
  const active = files.find((f) => f.id === activeId) ?? files[0];

  if (!active) return null;

  const highlighted =
    active.language === 'kotlin'
      ? highlightKotlin(active.code)
      : active.language === 'xml'
        ? highlightXML(active.code)
        : highlightGradle(active.code);

  const lineCount = active.code.split('\n').length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1020] overflow-hidden shadow-2xl">
      {/* File tabs */}
      <div className="flex flex-wrap gap-1 border-b border-white/10 bg-white/[0.02] p-2">
        {files.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveId(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeId === f.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-white border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* File path bar */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-2">
        <span className="text-xs text-slate-500 font-mono truncate">{active.path}</span>
        <span
          className={`ml-auto rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            langColors[active.language]
          }`}
        >
          {langLabels[active.language]}
        </span>
      </div>

      {/* Description */}
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 px-4 py-2.5">
        <p className="text-xs text-slate-300 leading-relaxed">{active.description}</p>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto">
        <pre className="m-0 p-0 text-sm leading-relaxed">
          <code className="block font-mono">
            <div className="flex">
              {/* Line numbers */}
              <div className="select-none border-r border-white/5 bg-black/20 px-3 py-4 text-right text-slate-600 text-xs font-mono">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <div
                className="flex-1 px-4 py-4 whitespace-pre text-slate-200"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </div>
          </code>
        </pre>
      </div>
    </div>
  );
}
