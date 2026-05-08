'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BMRCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [activity, setActivity] = useState('1.55');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ bmr: number; maintenance: number; weightLoss: number; weightGain: number } | null>(null);

    // Mifflin-St Jeor equation (1990) — clinically preferred over the
    // 1919 Harris-Benedict revision because it tracks measured RMR
    // ~5% closer in modern populations.
    function calculate() {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);
        const mult = parseFloat(activity);
        if (!(w > 0 && h > 0 && a > 0 && mult > 0)) {
            setError('Enter weight, height, and age — all values must be greater than zero.');
            setResult(null);
            return;
        }
        setError(null);
        const bmr = gender === 'Male'
            ? (10 * w) + (6.25 * h) - (5 * a) + 5
            : (10 * w) + (6.25 * h) - (5 * a) - 161;
        const maintenance = bmr * mult;
        setResult({
            bmr: Math.round(bmr),
            maintenance: Math.round(maintenance),
            weightLoss: Math.round(maintenance - 500),
            weightGain: Math.round(maintenance + 500),
        });
    }

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                    <span>/</span>
                    <span className="text-white">BMR Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Free Health Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        BMR & Calorie <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Calculate your Basal Metabolic Rate and daily calorie needs. Plan your diet for weight loss, maintenance, or muscle gain.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your BMR</h2>
                        <p className="text-sm text-slate-400">Enter your details to find your basal metabolic rate and daily calorie needs</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g., 70"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Height (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="e.g., 170"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age (years)</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g., 30"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Activity Level</label>
                            <select
                                value={activity}
                                onChange={e => setActivity(e.target.value)}
                                className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                            >
                                <option value="1.2">Sedentary — desk job, little or no exercise</option>
                                <option value="1.375">Lightly active — light exercise 1–3 days/week</option>
                                <option value="1.55">Moderately active — exercise 3–5 days/week</option>
                                <option value="1.725">Very active — hard exercise 6–7 days/week</option>
                                <option value="1.9">Extra active — physical job + daily training</option>
                            </select>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                        >
                            Calculate BMR & Calories
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="text-center p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Basal Metabolic Rate</p>
                                    <p className="text-4xl font-black text-white">{result.bmr}</p>
                                    <p className="text-sm text-slate-400">calories/day at rest</p>
                                </div>
                                <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Maintenance Calories</p>
                                    <p className="text-4xl font-black text-white">{result.maintenance}</p>
                                    <p className="text-sm text-slate-400">calories/day at chosen activity level</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                                    <p className="text-sm font-bold text-blue-400">For Weight Loss</p>
                                    <p className="text-2xl font-bold text-white">{result.weightLoss} cal/day</p>
                                    <p className="text-xs text-slate-400">~0.5 kg/week deficit</p>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                                    <p className="text-sm font-bold text-purple-400">For Weight Gain</p>
                                    <p className="text-2xl font-bold text-white">{result.weightGain} cal/day</p>
                                    <p className="text-xs text-slate-400">~0.5 kg/week surplus</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">What is BMR?</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            Basal Metabolic Rate (BMR) is the number of calories your body burns while at complete rest. It represents the minimum amount of energy needed to keep your body functioning, including breathing, circulation, and cell production.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Mifflin-St Jeor Equation</h3>
                        <p>This calculator uses the Mifflin-St Jeor equation (1990), now the clinically preferred formula because it tracks measured resting metabolic rate roughly 5% closer than the older Harris-Benedict revision:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5</li>
                            <li><strong>Women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161</li>
                        </ul>
                        <p>Maintenance calories are then BMR multiplied by an activity factor (1.2 sedentary → 1.9 extra active).</p>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Calculate your Body Mass Index' },
                            { name: 'Body Fat Calculator', href: '/tools/body-fat-calculator', desc: 'Estimate your body fat percentage' },
                            { name: 'Water Intake Calculator', href: '/tools/water-intake-calculator', desc: 'Find your daily water requirement' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-orange-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This BMR calculator provides estimates for informational purposes only. Individual calorie needs vary based on activity level, body composition, and health conditions. Consult a dietitian or healthcare provider for personalized nutrition advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
