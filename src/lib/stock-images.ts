/**
 * Editorial media registry. Each entry describes the *meaning* of a
 * slot (e.g. "the hero on the home page") and pairs it with a Lucide
 * icon. The icon is rendered by <MediaTile> inside an editorial,
 * Bureau-styled tile — never as a raw stock photo.
 *
 * Why icons instead of photos:
 *  - Generic stock photography reads as inauthentic and hard to keep
 *    relevant per condition / specialty.
 *  - Wikimedia hotlinks at scale are fragile (URLs change, no CDN).
 *  - The Bureau system already favours typography + hairlines over
 *    photographic decoration.
 *
 * Real photos still live for:
 *  - Per-condition imagery pulled from the DB (`data.images`) on
 *    condition detail pages.
 *  - Doctor profile photos (`profileImage`) on doctor cards.
 *  - Hospital photos populated by Google Places admin.
 *
 * If a section truly needs a photo, prefer adding it to the DB row
 * for that entity rather than back to this registry.
 */
import {
    Activity,
    BookOpen,
    Briefcase,
    Building2,
    ClipboardList,
    Compass,
    Droplet,
    FileText,
    FlaskConical,
    Heart,
    HelpCircle,
    Hospital,
    LayoutGrid,
    Microscope,
    Newspaper,
    Pill,
    Scissors,
    Search,
    Shield,
    Sparkles,
    Stethoscope,
    TestTube,
    UserRound,
    Users,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import {
    getSpecialtyLucideIcon,
    TREATMENT_LUCIDE_ICON,
} from './specialty-icons';

export type MediaTone = 'cobalt' | 'fog' | 'paper';

/**
 * Media slot describing an editorial tile. Compatible with the legacy
 * StockImage shape so existing consumers keep compiling — `src` is
 * always empty (we no longer hotlink stock photos), `width`/`height`
 * are kept for prop-shape compatibility but unused.
 */
export type StockImage = {
    /** Always empty in the new icon-led system. Kept for legacy props. */
    src: string;
    alt: string;
    width: number;
    height: number;
    /** Lucide icon used by MediaTile to render this slot. */
    icon: LucideIcon;
    /** Background tint used by the tile. */
    tone: MediaTone;
};

const slot = (
    icon: LucideIcon,
    alt: string,
    tone: MediaTone = 'cobalt',
    width = 1600,
    height = 1067,
): StockImage => ({ src: '', alt, width, height, icon, tone });

/* ─── HERO / WIDE EDITORIAL ───────────────────────── */
export const HERO_IMAGES = {
    consult: slot(Stethoscope, 'Two clinicians reviewing a case together'),
    lab: slot(FlaskConical, 'Diagnostic lab work and analysis'),
    tools: slot(Stethoscope, 'A clinician with diagnostic tools'),
    clinic: slot(Hospital, 'A bright modern hospital ward'),
    team: slot(Users, 'A clinical team working together'),
    surgery: slot(Scissors, 'A surgical procedure in progress'),
    operatingRoom: slot(Hospital, 'A modern operating room'),
};

/* ─── SPECIALTY THUMBNAILS (16:9) ─────────────────── */
const spec = (icon: LucideIcon, alt: string) => slot(icon, alt, 'cobalt', 800, 533);

export const SPECIALTY_IMAGES = {
    cardio: spec(Heart, 'Cardiology — heart and vascular care'),
    neuro: spec(getSpecialtyLucideIcon('Neurology'), 'Neurology — brain and nervous system'),
    dental: spec(getSpecialtyLucideIcon('Dentistry'), 'Dentistry — oral and dental care'),
    dentalAlt: spec(getSpecialtyLucideIcon('Dentistry'), 'Dentistry — oral and dental care'),
    derm: spec(Sparkles, 'Dermatology — skin, hair and nails'),
    eye: spec(getSpecialtyLucideIcon('Ophthalmology'), 'Ophthalmology — eyes and vision'),
    blood: spec(Droplet, 'Hematology — blood disorders and lab work'),
    medication: spec(Pill, 'Pharmacology — medicines and prescriptions'),
    geriatrics: spec(UserRound, 'Geriatrics — care for older adults'),
    telehealth: spec(Stethoscope, 'Telehealth — remote care and consultation'),
    doctorOutdoor: spec(UserRound, 'A doctor in a clinical setting'),
    doctorPortrait: spec(UserRound, 'A doctor in a clinical setting'),
    consultation: spec(Stethoscope, 'A consultation between clinicians'),
};

/* ─── TREATMENT IMAGES (3:2) ──────────────────────── */
const treat = (icon: LucideIcon, alt: string) => slot(icon, alt, 'cobalt', 1200, 800);

export const TREATMENT_IMAGES = {
    surgery: treat(TREATMENT_LUCIDE_ICON.surgery, 'Surgical procedures and operative care'),
    operatingRoom: treat(TREATMENT_LUCIDE_ICON.operatingRoom, 'A modern operating room'),
    radiology: treat(TREATMENT_LUCIDE_ICON.radiology, 'Radiology and medical imaging'),
    pills: treat(TREATMENT_LUCIDE_ICON.pills, 'Prescription medication'),
    pharmacy: treat(TREATMENT_LUCIDE_ICON.pharmacy, 'Over-the-counter medication'),
    recovery: treat(Heart, 'Recovery and aftercare'),
    imaging: treat(TREATMENT_LUCIDE_ICON.imaging, 'Diagnostic imaging'),
    lab: treat(TREATMENT_LUCIDE_ICON.lab, 'Laboratory testing'),
    wellness: treat(TREATMENT_LUCIDE_ICON.wellness, 'Wellness and lifestyle medicine'),
    rehab: treat(TREATMENT_LUCIDE_ICON.rehab, 'Rehabilitation and physical therapy'),
};

/* ─── ABOUT / CAREERS ─────────────────────────────── */
const about = (icon: LucideIcon, alt: string) => slot(icon, alt, 'fog', 1200, 800);

export const ABOUT_IMAGES = {
    team: about(Users, 'A small team collaborating'),
    training: about(Newspaper, 'A team training session'),
    meeting: about(ClipboardList, 'An editorial planning meeting'),
    pairing: about(Users, 'Two colleagues pairing on a problem'),
    portraitBlue: about(UserRound, 'An editorial portrait'),
    portraitRed: about(UserRound, 'An editorial portrait'),
};

/* ─── HOSPITAL / FACILITY ─────────────────────────── */
export const HOSPITAL_IMAGES = {
    ward: slot(Hospital, 'A hospital ward', 'fog', 1200, 800),
    consultation: slot(Stethoscope, 'A clinical consultation', 'cobalt', 1200, 800),
    reception: slot(Building2, 'A hospital reception', 'fog', 1200, 800),
    exterior: slot(Building2, 'A hospital building exterior', 'fog', 1200, 800),
};

/* ─── UTILITY (FAQ, BOOKING, EDITORIAL) ───────────── */
const util = (icon: LucideIcon, alt: string) => slot(icon, alt, 'fog', 1000, 667);

export const UTIL_IMAGES = {
    library: util(BookOpen, 'Reference library and longform content'),
    libraryAlt: util(BookOpen, 'Reference library and longform content'),
    pen: util(FileText, 'Editorial and writing'),
    analytics: util(LayoutGrid, 'Performance analytics dashboard'),
    presentation: util(Briefcase, 'A team presentation'),
};

/* ─── SPECIALTY → SLOT MAP ────────────────────────── */
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
    // Re-key against the specialty so the icon stays in sync with
    // whichever bucket SPECIALTY_TO_IMAGE points the name to.
    const slot = SPECIALTY_TO_IMAGE[specialty];
    if (!slot) return SPECIALTY_IMAGES.consultation;
    return { ...slot, icon: getSpecialtyLucideIcon(specialty), alt: `${specialty}` };
}

/* ─── Misc helpers consumers may want ─────────────── */
export const PAGE_ICONS = {
    home: Compass,
    search: Search,
    pricing: Wallet,
    insurance: Shield,
    help: HelpCircle,
    docs: FileText,
    activity: Activity,
    testTube: TestTube,
    microscope: Microscope,
};
