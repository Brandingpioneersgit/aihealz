/**
 * Curated stock image registry. Files live in /public/images/stock/
 * served with `Cache-Control: public, max-age=31536000, immutable`
 * (configured in next.config.ts).
 *
 * Image descriptions below reflect what each file *actually depicts*
 * after a visual audit — file names are historical and may not match
 * the content (e.g. `hero-consult.jpg` is a surgery scene). Always
 * trust the `alt` text, not the filename.
 */

import type { LucideIcon } from 'lucide-react';
import { Stethoscope, Microscope } from 'lucide-react';

export type StockImage = {
    src: string;
    alt: string;
    /** Width:height intrinsic ratio used by next/image for layout */
    width: number;
    height: number;
    /** Optional Lucide icon used by MediaTile when rendering an icon tile. */
    icon?: LucideIcon;
};

const make = (file: string, alt: string, width = 1600, height = 1067, icon?: LucideIcon): StockImage => ({
    src: `/images/stock/${file}`,
    alt,
    width,
    height,
    icon,
});

/* ─── HERO / WIDE EDITORIAL ───────────────────────── */
export const HERO_IMAGES = {
    /** Two clinicians reviewing a scan together — best "consultation" image. */
    consult: make('spec-warm.jpg', 'Two clinicians reviewing a patient scan together', 1600, 1067, Stethoscope),
    /** Researcher at a microscope in a bright laboratory. */
    lab: make('hero-lab.jpg', 'A researcher working at a microscope in a laboratory', 1600, 1067, Microscope),
    /** A clinician holding a stethoscope, editorial composition. */
    tools: make('hero-tools.jpg', 'A clinician holding a stethoscope, editorial portrait'),
    /** A bright, empty hospital ward — best "clinic" stand-in. */
    clinic: make('hospital-bright.jpg', 'A bright modern hospital ward with privacy curtains'),
    /** A surgical team in scrubs, viewed from below — dramatic, editorial. */
    team: make('hero-team.jpg', 'A surgical team in scrubs viewed from below'),
    /** Two surgeons mid-procedure in a modern operating room. */
    surgery: make('hero-consult.jpg', 'Two surgeons performing a procedure in a modern operating room'),
    /** A bright, empty modern operating room. */
    operatingRoom: make('hero-clinic.jpg', 'A bright modern operating room, ready for procedure'),
};

/* ─── SPECIALTY THUMBNAILS (16:9) ─────────────────── */
const spec = (file: string, alt: string) => make(file, alt, 800, 533);

export const SPECIALTY_IMAGES = {
    /** Anatomical heart model on a cardiology textbook — perfect for Cardiology. */
    cardio: spec('util-blood-lab.jpg', 'An anatomical heart model on an open cardiology textbook'),
    /** Anatomical brain model with neuron figure — for Neurology. */
    neuro: spec('spec-cardio-alt.jpg', 'An anatomical brain model with a neuron figure'),
    /** Dental examination close-up with mirror and probe. */
    dental: spec('spec-dental.jpg', 'A dental examination with mirror and probe'),
    /** Clinician reviewing dental X-rays on a lightbox. */
    dentalAlt: spec('spec-dental-alt.jpg', 'A clinician reviewing dental X-rays on a lightbox'),
    /** Skincare cleanser bottle — for Dermatology. */
    derm: spec('spec-derm.jpg', 'A skincare cleanser bottle, editorial flat lay'),
    /** Reading glasses resting on an open book — for Ophthalmology / vision. */
    eye: spec('spec-eye.jpg', 'A pair of reading glasses resting on an open book'),
    /** Blood collection tubes in a laboratory — for Hematology / Pathology. */
    blood: spec('spec-pediatric.jpg', 'Blood collection tubes in a laboratory'),
    /** Colourful tablets and capsules close-up — for Pharmacology / general meds. */
    medication: spec('spec-medication.jpg', 'A close-up of colourful tablets and capsules'),
    /** An older couple walking on a sunlit garden path — for Geriatrics / wellbeing. */
    geriatrics: spec('spec-neuro.jpg', 'An older couple walking together on a sunlit garden path'),
    /** A clinician holding a smartphone, stethoscope around the neck. */
    telehealth: spec('spec-stethoscope.jpg', 'A clinician using a smartphone with a stethoscope around the neck'),
    /** A doctor in white coat smiling outdoors — warm portrait. */
    doctorOutdoor: spec('spec-chart.jpg', 'A doctor in a white coat smiling outdoors'),
    /** A doctor with arms crossed holding a red stethoscope — generic clinician. */
    doctorPortrait: spec('spec-tablet.jpg', 'A doctor with arms crossed holding a stethoscope'),
    /** Two clinicians reviewing a radiology scan — the best general consultation image. */
    consultation: spec('spec-warm.jpg', 'Two clinicians reviewing a radiology scan together'),
};

/* ─── TREATMENT IMAGES (3:2) ──────────────────────── */
const treat = (file: string, alt: string) => make(file, alt, 1200, 800);

export const TREATMENT_IMAGES = {
    /** Two surgeons mid-procedure — for surgical-treatment cards. */
    surgery: treat('hero-consult.jpg', 'Two surgeons performing a procedure in an operating room'),
    /** Empty, bright operating room — sterile setting. */
    operatingRoom: treat('hero-clinic.jpg', 'A bright modern operating room, ready for procedure'),
    /** Radiologist reviewing brain CT scans on a lightbox. */
    radiology: treat('treat-equipment.jpg', 'A radiologist reviewing brain CT scans on a lightbox'),
    /** Pill blister packs on a blue surface. */
    pills: treat('treat-pills.jpg', 'Pharmaceutical pill blister packs on a blue surface'),
    /** Pills, capsules, thermometer and a mask on a yellow background. */
    pharmacy: treat('treat-pharmacy.jpg', 'An assortment of pills, capsules and a thermometer on a yellow background'),
    /** Patient resting in a hospital bed with a nasal cannula. */
    recovery: treat('treat-recovery.jpg', 'A patient resting in a hospital bed during recovery'),
    /** Hand X-ray displayed on a viewing screen. */
    imaging: treat('treat-imaging.jpg', 'A hand X-ray displayed on a viewing screen'),
    /** Laboratory technician with a pipette and reagent vials. */
    lab: treat('treat-surgery-alt.jpg', 'A laboratory technician with a pipette and reagent vials'),
    /** A wellness yoga class in a sunlit studio. */
    wellness: treat('treat-wellness.jpg', 'A wellness yoga class in a sunlit studio'),
    /** Active rehabilitation — a person on a yoga mat doing core work. */
    rehab: treat('treat-fitness.jpg', 'A person on a yoga mat doing core work in a bright gym'),
};

/* ─── ABOUT / CAREERS ─────────────────────────────── */
const about = (file: string, alt: string) => make(file, alt, 1200, 800);

export const ABOUT_IMAGES = {
    /** A small team collaborating around a shared workspace table. */
    team: about('about-team.jpg', 'A small team collaborating around a shared workspace table'),
    /** A team in a training session in a modern office. */
    training: about('about-office.jpg', 'A team in a training session in a modern office'),
    /** A team meeting around a large conference table by tall windows. */
    meeting: about('about-portrait.jpg', 'A team meeting around a large conference table'),
    /** Two colleagues pairing on a laptop with handwritten notes — true collaboration. */
    pairing: about('about-workspace.jpg', 'Two colleagues pairing on a laptop with handwritten notes'),
    /** Editorial portrait — young professional in blue. */
    portraitBlue: about('about-collaboration.jpg', 'A young professional in a blue dress, editorial portrait'),
    /** Editorial portrait — young woman laughing. */
    portraitRed: about('about-portrait-2.jpg', 'A young woman laughing, editorial portrait'),
};

/* ─── HOSPITAL / FACILITY ─────────────────────────── */
export const HOSPITAL_IMAGES = {
    /** A bright, empty hospital ward with privacy curtains. */
    ward: make('hospital-bright.jpg', 'A bright empty hospital ward with privacy curtains', 1200, 800),
    /** A nurse taking a patient's blood pressure — clinical care moment. */
    consultation: make('hospital-interior.jpg', 'A nurse taking a patient’s blood pressure', 1200, 800),
    /** A modern hospital reception interior. */
    reception: make('util-clinic-bright.jpg', 'A modern hospital reception desk', 1200, 800),
    /** Brick exterior of a modern hospital with covered drop-off. */
    exterior: make('hospital-reception.jpg', 'The brick exterior of a modern hospital with covered drop-off', 1200, 800),
};

/* ─── UTILITY (FAQ, BOOKING, EDITORIAL) ───────────── */
const util = (file: string, alt: string) => make(file, alt, 1000, 667);

export const UTIL_IMAGES = {
    /** A curved library with rows of bookshelves. */
    library: util('util-library.jpg', 'A curved library with rows of bookshelves'),
    /** Library bookshelves stretching down a corridor under hanging lights. */
    libraryAlt: util('util-reading.jpg', 'Library bookshelves stretching down a corridor under hanging lights'),
    /** A fountain pen writing cursive on lined paper — for editorial / writing. */
    pen: util('util-writing.jpg', 'A fountain pen writing cursive on lined paper'),
    /** Analytics dashboard with traffic and performance charts. */
    analytics: util('util-analytics.jpg', 'An analytics dashboard with traffic and performance charts'),
    /** A leader presenting to a small team in an open-plan office. */
    presentation: util('util-office-detail.jpg', 'A leader presenting to a small team in an open office'),
};

/* ─── SPECIALTY → IMAGE MAP ───────────────────────── */
/**
 * Maps canonical specialty names (as returned by normalize-specialty.ts)
 * to a curated stock image. Any specialty not in the map falls back to
 * SPECIALTY_IMAGES.consultation — a neutral clinician-at-monitor shot.
 */
export const SPECIALTY_TO_IMAGE: Record<string, StockImage> = {
    'Cardiology': SPECIALTY_IMAGES.cardio,
    'Cardiothoracic & Vascular Surgery': SPECIALTY_IMAGES.cardio,
    'Vascular Surgery': SPECIALTY_IMAGES.cardio,
    'Neurology': SPECIALTY_IMAGES.neuro,
    'Neurosurgery': SPECIALTY_IMAGES.neuro,
    'Dermatology': SPECIALTY_IMAGES.derm,
    'Plastic Surgery': SPECIALTY_IMAGES.derm,
    'Ophthalmology': SPECIALTY_IMAGES.eye,
    'Dentistry': SPECIALTY_IMAGES.dental,
    'Maxillofacial & Oral Surgery': SPECIALTY_IMAGES.dentalAlt,
    'Hematology': SPECIALTY_IMAGES.blood,
    'Hematology / Oncology': SPECIALTY_IMAGES.blood,
    'Pathology': SPECIALTY_IMAGES.blood,
    'Nephrology': SPECIALTY_IMAGES.blood,
    'Urology': SPECIALTY_IMAGES.blood,
    'Endocrinology': SPECIALTY_IMAGES.medication,
    'Allergy & Immunology': SPECIALTY_IMAGES.medication,
    'Infectious Disease': SPECIALTY_IMAGES.medication,
    'Gastroenterology': SPECIALTY_IMAGES.medication,
    'Hepatology': SPECIALTY_IMAGES.medication,
    'Geriatrics': SPECIALTY_IMAGES.geriatrics,
    'Palliative Care': SPECIALTY_IMAGES.geriatrics,
    'Sleep Medicine': SPECIALTY_IMAGES.geriatrics,
    'Psychiatry': SPECIALTY_IMAGES.geriatrics,
    'Radiology': TREATMENT_IMAGES.radiology,
    'Nuclear Medicine': TREATMENT_IMAGES.radiology,
    'Radiation Oncology': TREATMENT_IMAGES.radiology,
    'Orthopedic Surgery': TREATMENT_IMAGES.imaging,
    'Orthopedics': TREATMENT_IMAGES.imaging,
    'Rheumatology': TREATMENT_IMAGES.imaging,
    'Sports Medicine': TREATMENT_IMAGES.rehab,
    'Physical Medicine & Rehabilitation': TREATMENT_IMAGES.rehab,
    'Anesthesiology': HERO_IMAGES.operatingRoom,
    'General Surgery': HERO_IMAGES.surgery,
    'Pulmonology': SPECIALTY_IMAGES.telehealth,
    'ENT (Ear, Nose, Throat)': SPECIALTY_IMAGES.doctorPortrait,
    'Pediatrics': SPECIALTY_IMAGES.doctorOutdoor,
    'Neonatology': SPECIALTY_IMAGES.doctorOutdoor,
    'Family Medicine': SPECIALTY_IMAGES.doctorOutdoor,
    'Obstetrics & Gynecology': SPECIALTY_IMAGES.doctorOutdoor,
    'Preventive Medicine': SPECIALTY_IMAGES.doctorOutdoor,
    'Occupational Medicine': SPECIALTY_IMAGES.consultation,
    'General Medicine': SPECIALTY_IMAGES.consultation,
    'Internal Medicine': SPECIALTY_IMAGES.consultation,
    'Emergency Medicine': SPECIALTY_IMAGES.consultation,
    'Oncology': SPECIALTY_IMAGES.consultation,
    'Pain Management': SPECIALTY_IMAGES.consultation,
    'Immunology': SPECIALTY_IMAGES.consultation,
    'Genetics': HERO_IMAGES.lab,
};

export function getSpecialtyImage(specialty: string | null | undefined): StockImage {
    if (!specialty) return SPECIALTY_IMAGES.consultation;
    return SPECIALTY_TO_IMAGE[specialty] || SPECIALTY_IMAGES.consultation;
}
