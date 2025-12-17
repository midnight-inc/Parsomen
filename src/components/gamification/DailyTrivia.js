"use client";
import { useState, useEffect } from 'react';
import { FaBrain, FaCheck, FaTimes, FaTrophy, FaMedal } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function DailyTrivia() {
    const { user, reloadUser } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0); // 0=Intro, 1..N=Questions, 99=Result
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [hasPlayedToday, setHasPlayedToday] = useState(false);

    useEffect(() => {
        // Check local storage or API if user played today
        if (user) checkStatus();
    }, [user]);

    const checkStatus = async () => {
        // This endpoint could return "played: true" in GET ideally, but for now we fetch Qs
        try {
            const res = await fetch('/api/gamification/trivia');
            const data = await res.json();
            if (data.success) {
                if (data.played) {
                    setHasPlayedToday(true);
                }
                setQuestions(data.questions);
            }
        } catch (e) { }
    };

    const handleOptionSelect = (qId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    };

    const handleNext = () => {
        if (currentStep < questions.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            submitAnswers();
        }
    };

    const submitAnswers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gamification/trivia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            const data = await res.json();

            if (data.success) {
                setResult(data);
                setCurrentStep(99);
                if (data.earnedXP > 0) {
                    toast.success(
                        <div className="flex items-center gap-2">
                            <FaMedal /> <span>+{data.earnedXP} XP Kazandın!</span>
                        </div>
                    );
                    reloadUser();
                }
            } else {
                toast.error(data.message || 'Hata oluştu');
                if (data.message.includes('Bugünlük')) {
                    setHasPlayedToday(true);
                }
            }
        } catch (e) {
            toast.error('Bağlantı hatası');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;
    if (hasPlayedToday) return (
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/20 rounded-xl p-6 text-center">
            <FaBrain className="text-4xl text-purple-400 mx-auto mb-3 opacity-50" />
            <h3 className="font-bold text-white">Bugünlük Bu Kadar!</h3>
            <p className="text-gray-400 text-sm mt-2">Yarın yeni sorularla görüşürüz.</p>
        </div>
    );

    // Intro Screen
    if (currentStep === 0) {
        return (
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FaBrain className="text-8xl text-purple-500 transform rotate-12" />
                </div>

                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <FaBrain className="text-purple-400" /> Günlük Bilgi Yarışması
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                    Edebiyat bilgeni test et, her gün 3 soru cevapla ve XP kazan!
                    <br /><span className="text-yellow-500 text-xs">3/3 yaparsan bonus ödül var.</span>
                </p>

                <Button onClick={() => setCurrentStep(1)} fullWidth className="bg-purple-600 hover:bg-purple-500">
                    Yarışmaya Başla
                </Button>
            </div>
        );
    }

    // Result Screen
    if (currentStep === 99 && result) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500 text-3xl">
                    <FaTrophy />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{result.earnedXP} XP Kazandın!</h3>
                <p className="text-gray-400 mb-6">
                    {result.correctCount} / {questions.length} doğru cevap.
                </p>
                <Button onClick={() => setCurrentStep(0)} variant="secondary" fullWidth className="text-sm">
                    Kapat
                </Button>
            </div>
        );
    }

    // Question Screen
    const currentQ = questions[currentStep - 1]; // Step 1 is index 0
    if (!currentQ) return null; // Should not happen

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500 uppercase">
                <span>Soru {currentStep} / {questions.length}</span>
                <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded">TRIVIA</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-6">{currentQ.text}</h3>

            <div className="space-y-2">
                {currentQ.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(currentQ.id, idx)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${answers[currentQ.id] === idx
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750 hover:border-gray-600'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800">
                <Button
                    onClick={handleNext}
                    disabled={answers[currentQ.id] === undefined || loading}
                    fullWidth
                    className="bg-white text-black hover:bg-gray-200"
                >
                    {currentStep === questions.length ? 'Sonuçları Gör' : 'Sıradaki Soru'}
                </Button>
            </div>
        </div>
    );
}
