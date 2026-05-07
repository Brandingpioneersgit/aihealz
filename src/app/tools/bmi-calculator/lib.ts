/**
 * Pure BMI categorisation helpers — extracted from page.tsx so they can be
 * unit-tested without rendering the React tree.
 *
 * Categories follow the WHO BMI classification with obesity classes I/II/III.
 */

export type BmiCategory =
    | 'Severe thinness'
    | 'Moderate thinness'
    | 'Mild thinness'
    | 'Normal weight'
    | 'Overweight (pre-obese)'
    | 'Obesity class I'
    | 'Obesity class II'
    | 'Obesity class III';

export function categorizeBmi(bmi: number): BmiCategory {
    if (bmi < 16) return 'Severe thinness';
    if (bmi < 17) return 'Moderate thinness';
    if (bmi < 18.5) return 'Mild thinness';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight (pre-obese)';
    if (bmi < 35) return 'Obesity class I';
    if (bmi < 40) return 'Obesity class II';
    return 'Obesity class III';
}
