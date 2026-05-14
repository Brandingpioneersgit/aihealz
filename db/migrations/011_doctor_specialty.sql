-- 011_doctor_specialty.sql
-- Adds a denormalized `specialty` column to doctors_providers.
--
-- Why: condition pages match doctors by specialty (every condition in a
-- specialty should surface that specialty's doctors, region-filtered).
-- The doctor_specialties join table can't model "all conditions in a
-- specialty" without ~25M rows, so we match on an indexed column instead.
--
-- Safe to re-run (IF NOT EXISTS guards).

ALTER TABLE doctors_providers
  ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);

CREATE INDEX IF NOT EXISTS doctors_providers_specialty_geo_verified_idx
  ON doctors_providers (specialty, geography_id, is_verified);

-- Normalize a handful of mislabeled condition specialist_type values
-- (singular "Cardiologist" → canonical "Cardiology", etc.) so the
-- doctor.specialty ↔ condition.specialist_type match is exact.
UPDATE medical_conditions SET specialist_type = 'Cardiology'        WHERE specialist_type = 'Cardiologist';
UPDATE medical_conditions SET specialist_type = 'Gastroenterology'  WHERE specialist_type = 'Gastroenterologist';
UPDATE medical_conditions SET specialist_type = 'Endocrinology'     WHERE specialist_type = 'Endocrinologist';
UPDATE medical_conditions SET specialist_type = 'Dermatology'       WHERE specialist_type = 'Dermatologist';
UPDATE medical_conditions SET specialist_type = 'Oncology'          WHERE specialist_type = 'Oncologist';
UPDATE medical_conditions SET specialist_type = 'Psychiatry'        WHERE specialist_type = 'Psychiatrist';
UPDATE medical_conditions SET specialist_type = 'Neurology'         WHERE specialist_type = 'Neurologist';
UPDATE medical_conditions SET specialist_type = 'Pulmonology'       WHERE specialist_type = 'Pulmonologist';
UPDATE medical_conditions SET specialist_type = 'Orthopedics'       WHERE specialist_type = 'Orthopedic Surgeon';
UPDATE medical_conditions SET specialist_type = 'Ophthalmology'     WHERE specialist_type = 'Ophthalmologist';
UPDATE medical_conditions SET specialist_type = 'Urology'           WHERE specialist_type = 'Urologist';
UPDATE medical_conditions SET specialist_type = 'Rheumatology'      WHERE specialist_type = 'Rheumatologist';
UPDATE medical_conditions SET specialist_type = 'Obstetrics'        WHERE specialist_type = 'Gynecologist';
UPDATE medical_conditions SET specialist_type = 'ENT'               WHERE specialist_type = 'ENT Specialist';
UPDATE medical_conditions SET specialist_type = 'Hematology'        WHERE specialist_type = 'Hematologist';
UPDATE medical_conditions SET specialist_type = 'Podiatry'          WHERE specialist_type = 'Podiatrist';
UPDATE medical_conditions SET specialist_type = 'General Medicine'  WHERE specialist_type = 'Internal Medicine';
