import React, { useEffect, useState, useMemo } from 'react';
import { Target, Trophy, Flame, TrendingUp, X, Award, BarChart3, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProjectData } from '../types';
import { cn } from '../lib/utils';

interface GoalTrackerProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
}

const BADGES = [
  { id: 'start', title: 'خطوة الألف ميل', desc: 'كتابة أول حرف', target: 1, icon: '🌱', color: 'text-emerald-400' },
  { id: '500', title: 'مقدمة مثيرة', desc: '500 كلمة', target: 500, icon: '🎭', color: 'text-indigo-400' },
  { id: '1k', title: 'بداية القصة', desc: '1,000 كلمة', target: 1000, icon: '📜', color: 'text-amber-500' },
  { id: '2k5', title: 'بناء العوالم', desc: '2,500 كلمة', target: 2500, icon: '🌍', color: 'text-cyan-400' },
  { id: '5k', title: 'قلم واعد', desc: '5,000 كلمة', target: 5000, icon: '🖋️', color: 'text-blue-400' },
  { id: '10k', title: 'حبكة متماسكة', desc: '10,000 كلمة', target: 10000, icon: '🔥', color: 'text-orange-500' },
  { id: '15k', title: 'ذروة الأحداث', desc: '15,000 كلمة', target: 15000, icon: '⚡', color: 'text-yellow-300' },
  { id: '25k', title: 'روائي محترف', desc: '25,000 كلمة', target: 25000, icon: '📖', color: 'text-purple-400' },
  { id: '40k', title: 'نهاية قريبة', desc: '40,000 كلمة', target: 40000, icon: '⏳', color: 'text-rose-400' },
  { id: '50k', title: 'ملحمة أدبية', desc: '50,000 كلمة', target: 50000, icon: '👑', color: 'text-yellow-400' },
  { id: '75k', title: 'كاتب مخضرم', desc: '75,000 كلمة', target: 75000, icon: '🌠', color: 'text-teal-400' },
  { id: '100k', title: 'أسطورة أدبية', desc: '100,000 كلمة', target: 100000, icon: '🏆', color: 'text-yellow-500' },
];

export const GoalTracker: React.FC<GoalTrackerProps> = ({ project, updateProject }) => {
  const [wordCount, setWordCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Compute total word count safely
  useEffect(() => {
    let count = 0;
    project.pages.forEach(page => {
      page.blocks.forEach(block => {
        if (block.type === 'text' || block.type === 'dialogue') {
          const text = (block.content || '').replace(/<[^>]*>?/gm, ' ');
          const words = text.trim().split(/\s+/).filter(w => w.length > 0);
          count += words.length;
        }
      });
    });
    setWordCount(count);
  }, [project.pages]);

  const todayStr = new Date().toISOString().split('T')[0];
  const goal = project.dailyGoal || 1000;
  
  // Word History Tracking Logic
  const history = project.wordCountHistory || {};
  
  // Track start of today's word count to calculate daily delta 
  // If no entry for today, we record the CURRENT word count as the starting point.
  useEffect(() => {
    if (history[todayStr] === undefined) {
      updateProject({
        wordCountHistory: {
          ...history,
          [todayStr]: wordCount
        }
      });
    }
  }, [todayStr, wordCount, history]);

  const todayStart = history[todayStr] !== undefined ? history[todayStr] : wordCount;
  // Make sure we don't display negative if user deletes a lot today
  const wordsToday = Math.max(0, wordCount - todayStart);
  const progress = Math.min(100, Math.round((wordsToday / goal) * 100));

  // Auto-celebration
  useEffect(() => {
    if (progress >= 100 && !showConfetti && wordsToday > 0) {
      setShowConfetti(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [progress, showConfetti, wordsToday]);

  // Calculate Streak
  const streak = useMemo(() => {
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1); // start checking from yesterday

    // If they hit goal today, streak is at least 1. If not, wait for yesterday.
    let hitToday = wordsToday >= goal;
    if (hitToday) currentStreak = 1;

    let historyDays = Object.keys(history).sort().reverse();
    for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        // In a real sophisticated app, history would store END of day values.
        // Here we just check if they recorded any wordCount that day.
        // For simplicity: as long as a key exists and total wordCount > 0, they opened the app.
        // To be strict, streak should be "hit daily goal". We'll just define streak as "days interacted".
        if (history[dateStr] !== undefined) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return currentStreak;
  }, [history, wordsToday, goal]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "px-3 py-1.5 border rounded transition-colors flex items-center justify-center gap-2",
          progress >= 100 ? "bg-green-500/10 border-green-500/50 text-green-600" : "bg-transparent border-[var(--border)] hover:bg-[#2a2a2a] text-[var(--text)]"
        )}
        title="الإحصائيات والأهداف"
      >
        <Target size={16} />
        <span className="text-xs font-bold font-mono">{wordsToday} / {goal}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-[var(--border)] bg-black/20">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[var(--accent)]" />
                <h2 className="font-bold text-sm tracking-wider">لوحة الإحصائيات والإنجازات</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-[var(--text-dim)] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Daily Progress Section */}
              <section className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                   <Target size={120} />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                  <div className="flex-1 w-full">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-1">تقدم اليوم</h3>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-4xl font-extrabold font-sans leading-none">{wordsToday}</span>
                      <span className="text-sm text-[var(--text-dim)] mb-1">/ {goal} كلمة</span>
                    </div>
                    
                    <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden border border-[var(--border)]">
                      <div 
                        className={cn("h-full transition-all duration-1000", progress >= 100 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-[var(--accent)]")} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    {progress >= 100 && <p className="text-xs text-green-400 font-bold mt-2">أحسنت! لقد حققت هدفك اليومي 🎉</p>}
                  </div>
                  
                  <div className="bg-black/20 border border-[var(--border)] p-3 rounded-lg flex flex-col gap-2 min-w-[150px]">
                     <label className="text-xs text-[var(--text-dim)] flex items-center gap-1"><Edit3 size={12}/> تعديل الهدف:</label>
                     <input 
                        type="number" 
                        value={goal}
                        onChange={e => updateProject({ dailyGoal: Number(e.target.value) })}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm font-bold text-center outline-none focus:border-[var(--accent)] transition-colors"
                      />
                  </div>
                </div>
              </section>

              {/* General Stats */}
              <section className="grid grid-cols-2 gap-4">
                 <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                    <div className="bg-purple-500/10 p-3 rounded-full mb-3">
                       <TrendingUp size={24} className="text-purple-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-bold mb-1">المجمل الكلي</span>
                    <span className="text-3xl font-extrabold font-serif text-white">{wordCount.toLocaleString()} <span className="text-sm font-normal text-[var(--text-dim)]">كلمة</span></span>
                 </div>
                 
                 <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                    <div className="bg-orange-500/10 p-3 rounded-full mb-3 relative">
                       <Flame size={24} className="text-orange-500" />
                       {streak > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-bold mb-1">أيام الاستمرار (Streak)</span>
                    <span className="text-3xl font-extrabold font-serif text-white">{streak} <span className="text-sm font-normal text-[var(--text-dim)]">يوم</span></span>
                 </div>
              </section>

              {/* Achievements Engine */}
              <section className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                   <Award size={18} className="text-yellow-500" />
                   <h3 className="text-sm font-bold">أوسمة الإنجاز</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {BADGES.map(badge => {
                     const isUnlocked = wordCount >= badge.target;
                     return (
                        <div key={badge.id} className={cn(
                           "flex flex-col items-center text-center p-4 border rounded-xl transition-all duration-300",
                           isUnlocked ? "bg-black/30 border-[#333] grayscale-0" : "bg-transparent border-[var(--border)] grayscale opacity-40"
                        )}>
                           <div className="text-3xl mb-2 filter drop-shadow-md">{badge.icon}</div>
                           <span className={cn("font-bold text-sm mb-1", isUnlocked ? badge.color : "text-[var(--text)]")}>{badge.title}</span>
                           <span className="text-[10px] text-[var(--text-dim)]">{badge.desc}</span>
                        </div>
                     )
                  })}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
