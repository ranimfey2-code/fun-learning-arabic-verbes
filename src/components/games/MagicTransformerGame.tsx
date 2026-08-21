import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MAGIC_TRANSFORM_QUESTIONS } from '../../data/gamesData';
import { UserProgress } from '../../types';
import { SoundButton } from '../SoundButton';
import { Wand2, Sparkles, ArrowLeft, RotateCcw, Check, X } from 'lucide-react';
import { soundEffects, ArabicSpeechEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface MagicTransformerGameProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onBackToMenu: () => void;
}

export const MagicTransformerGame: React.FC<MagicTransformerGameProps> = ({
  progress,
  onUpdateProgress,
  onBackToMenu
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isWandWaving, setIsWandWaving] = useState(false);

  const currentQ = MAGIC_TRANSFORM_QUESTIONS[questionIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedOption || isGameOver) return;

    soundEffects.playMagic();
    setIsWandWaving(true);
    setSelectedOption(opt);

    const isCorrect = opt === currentQ.correctWord;

    setTimeout(() => {
      setIsWandWaving(false);
      if (isCorrect) {
        soundEffects.playCorrect();
        setScore(prev => prev + 1);
        const praise = `سِحْرٌ بَاهِرٌ! (${currentQ.baseWord}) يَتَحَوَّلُ إِلَى (${opt})!`;
        setFeedback({ text: praise, isCorrect: true });
        ArabicSpeechEngine.speak(praise, progress.speechRate);
      } else {
        soundEffects.playWrong();
        const msg = `تَحْوِيلٌ غَيْرُ دَقِيقٍ. الصَّحِيحُ هُوَ: (${currentQ.correctWord}).`;
        setFeedback({ text: msg, isCorrect: false });
        ArabicSpeechEngine.speak(msg, progress.speechRate);
      }

      setTimeout(() => {
        setSelectedOption(null);
        setFeedback(null);

        if (questionIndex + 1 < MAGIC_TRANSFORM_QUESTIONS.length) {
          setQuestionIndex(prev => prev + 1);
        } else {
          setIsGameOver(true);
          soundEffects.playFanfare();
          confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });

          onUpdateProgress(prev => ({
            ...prev,
            stars: prev.stars + 30,
            gems: prev.gems + 2,
            gameScores: {
              ...prev.gameScores,
              transformer: (prev.gameScores.transformer || 0) + 1
            }
          }));
        }
      }, 2500);
    }, 600);
  };

  const handleRestart = () => {
    soundEffects.playClick();
    setQuestionIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-pink-300 shadow-lg p-4 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-pink-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-pink-100 text-pink-900 text-xs font-black px-3 py-1 rounded-full font-tajawal">
              عَصَا التَّحْوِيلِ السِّحْرِيَّةِ 🪄
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-pink-700 text-xs font-bold font-tajawal">
              التَّحَدِّي {questionIndex + 1} مِنْ {MAGIC_TRANSFORM_QUESTIONS.length}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-pink-950 font-baloo leading-tight tashkeel-text">
            حَوِّلِ الْفِعْلَ بِعَصَاكَ السِّحْرِيَّةِ:
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToMenu}
            type="button"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold font-tajawal flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>الْأَلْعَابُ</span>
          </button>
          <SoundButton
            textToSpeak={`حَوِّلِ الْفِعْلَ: ${currentQ.baseWord} مِنْ ${currentQ.fromTense} إِلَى ${currentQ.toTense}`}
            size="md"
            variant="amber"
            label="اِسْتَمِعْ لِلطَّلَبِ"
            rate={progress.speechRate}
          />
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-6">
          {/* Magic Cauldron / Stage */}
          <motion.div
            key={currentQ.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-tr from-purple-100 via-pink-50 to-rose-100 border-4 border-pink-300 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-inner"
          >
            {/* Sparkles */}
            <div className="absolute top-3 left-4 text-2xl animate-twinkle">✨</div>
            <div className="absolute bottom-3 right-4 text-2xl animate-twinkle">🪄</div>

            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
              {/* Base Word */}
              <div className="bg-white/90 border-2 border-purple-300 px-5 py-3 rounded-2xl shadow-sm">
                <span className="text-xs font-bold font-tajawal text-purple-700 block mb-1">
                  {currentQ.fromTense}
                </span>
                <span className="text-3xl sm:text-4xl font-black font-baloo text-purple-950 tashkeel-text">
                  {currentQ.baseWord}
                </span>
              </div>

              {/* Animated Magic Wand in between */}
              <motion.div
                animate={
                  isWandWaving
                    ? { rotate: [0, -30, 30, -15, 0], scale: [1, 1.3, 1] }
                    : { rotate: [0, -10, 10, 0] }
                }
                transition={{ repeat: isWandWaving ? 0 : Infinity, duration: isWandWaving ? 0.6 : 3 }}
                className="text-4xl sm:text-5xl"
              >
                🪄
              </motion.div>

              {/* Target Transformation Goal */}
              <div className="bg-white/90 border-2 border-rose-300 px-5 py-3 rounded-2xl shadow-sm">
                <span className="text-xs font-bold font-tajawal text-rose-700 block mb-1">
                  الْمَطْلُوبُ تَحْوِيلُهُ إِلَى:
                </span>
                <span className="text-lg sm:text-xl font-black font-baloo text-rose-950">
                  {currentQ.toTense}
                </span>
              </div>
            </div>

            <p className="text-base font-bold font-tajawal text-purple-900">
              اِضْغَطْ عَلَى الْفِعْلِ الصَّحِيحِ لِتُطْلِقَ السِّحْرَ! ✨
            </p>
          </motion.div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {currentQ.options.map(opt => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctWord;

              return (
                <motion.button
                  key={opt}
                  id={`magic-opt-${opt}`}
                  whileHover={{ scale: selectedOption ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectOption(opt)}
                  type="button"
                  className={`p-4 sm:p-5 rounded-3xl border-3 text-xl sm:text-2xl font-black font-baloo transition-all cursor-pointer select-none tashkeel-text flex items-center justify-center gap-2 ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-md ring-4 ring-emerald-300'
                        : 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-white hover:bg-pink-50 border-pink-200 hover:border-pink-400 text-slate-800 shadow-sm'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    isCorrect ? <Check size={20} className="text-emerald-600" /> : <X size={20} className="text-rose-600" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between text-base font-tajawal font-bold ${
                feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <span>{feedback.text}</span>
            </motion.div>
          )}
        </div>
      ) : (
        /* Game Over */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-pink-100 via-rose-100 to-purple-100 border-3 border-pink-400 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-xl"
        >
          <div className="text-6xl animate-bounce">🪄✨</div>
          <h3 className="text-2xl sm:text-3xl font-black font-baloo text-pink-950">
            أَنْتَ سَاحِرُ الْأَفْعَالِ الْعَبْقَرِيُّ!
          </h3>
          <p className="text-lg font-bold font-tajawal text-pink-900">
            حَوَّلْتَ {score} مِنْ {MAGIC_TRANSFORM_QUESTIONS.length} أَفْعَالٍ بِإِتْقَانٍ وَرَبِحْتَ 30 نَجْمَةً وَجَوْهَرَتَيْنِ! 💎
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onBackToMenu}
              type="button"
              className="bg-pink-600 hover:bg-pink-700 text-white font-tajawal font-bold text-lg px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all cursor-pointer btn-chunky"
            >
              الْعَوْدَةُ لِقَائِمَةِ الْأَلْعَابِ 🎮
            </button>
            <button
              onClick={handleRestart}
              type="button"
              className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-tajawal font-bold px-4 py-3 rounded-2xl flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>إِعَادَةُ التَّحْوِيلِ</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
