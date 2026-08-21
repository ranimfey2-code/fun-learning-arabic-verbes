/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTab, UserProgress } from './types';
import { INITIAL_USER_PROGRESS } from './data/rewardsData';
import { Navbar } from './components/Navbar';
import { LessonsView } from './components/LessonsView';
import { GamesHub } from './components/GamesHub';
import { RewardsView } from './components/RewardsView';
import { ParentTeacherGuide } from './components/ParentTeacherGuide';
import { soundEffects, ArabicSpeechEngine } from './utils/audio';
import { Sparkles, Heart, Volume2 } from 'lucide-react';

const STORAGE_KEY = 'faal_kid_app_progress_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('lessons');
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...INITIAL_USER_PROGRESS, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('Failed to load saved progress:', e);
      }
    }
    return INITIAL_USER_PROGRESS;
  });

  // Save progress changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.warn('Failed to persist progress:', e);
      }
    }
  }, [progress]);

  // Synchronize mute state
  useEffect(() => {
    soundEffects.setMuted(!progress.soundEnabled);
  }, [progress.soundEnabled]);

  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => updater(prev));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-yellow-50 text-slate-800 flex flex-col justify-between selection:bg-amber-300 selection:text-amber-950 font-baloo">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        progress={progress}
        onUpdateProgress={updateProgress}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-8 flex-1">
        {currentTab === 'lessons' && (
          <LessonsView
            progress={progress}
            onUpdateProgress={updateProgress}
            onGoToGames={() => setCurrentTab('games')}
          />
        )}

        {currentTab === 'games' && (
          <GamesHub
            progress={progress}
            onUpdateProgress={updateProgress}
            onGoToRewards={() => setCurrentTab('rewards')}
          />
        )}

        {currentTab === 'rewards' && (
          <RewardsView
            progress={progress}
            onUpdateProgress={updateProgress}
          />
        )}

        {currentTab === 'guide' && (
          <ParentTeacherGuide />
        )}
      </main>

      {/* Kid-Friendly Footer */}
      <footer className="bg-white/80 border-t-2 border-amber-200 py-4 px-4 mt-8 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-bold font-tajawal text-amber-900">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            <span>تَطْبِيقُ «عَالَمُ الأَفْعَالِ» • مُخَصَّصٌ لِتَلَامِيذِ السَّنَةِ الثَّانِيَةِ ابْتِدَائِي</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>تَعَلَّمْ بِمَرَحٍ وَنَشَاطٍ • يَعْمَلُ بِدُونِ إِنْتَرْنِت 100% 🚀</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
