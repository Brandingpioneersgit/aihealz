#!/usr/bin/env node
// One-off: replace placeholder content on 4 injectable treatments whose
// description was "Frequency: <X>" with real, drug-specific clinical content.

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'public/data/treatments.json');

const UPDATES = {
  'Insulin Glargine (Lantus)': {
    description:
      'Insulin Glargine (Lantus) is a long-acting basal insulin analog used to manage blood glucose in adults and children with type 1 diabetes and in adults with type 2 diabetes. Injected subcutaneously once daily, it provides a steady, relatively peakless insulin level over approximately 24 hours.',
    mechanism:
      'Insulin glargine is a recombinant human insulin analog modified so it precipitates at physiologic pH after subcutaneous injection. Slow redissolution of these microprecipitates releases insulin gradually over ~24 hours, stimulating glucose uptake into muscle and fat and suppressing hepatic glucose production to lower blood glucose without a pronounced peak.',
    indications: [
      'Type 1 diabetes mellitus (basal insulin requirement)',
      'Type 2 diabetes mellitus when oral agents fail to achieve glycemic targets',
      'Insulin-requiring gestational diabetes',
      'Transition from intermediate-acting (NPH) insulin to a peakless basal regimen',
      'Maintenance basal insulin after recovery from diabetic ketoacidosis',
    ],
    sideEffects: [
      'Hypoglycemia (most common; can be severe or nocturnal)',
      'Weight gain',
      'Injection-site reactions: redness, swelling, lipodystrophy',
      'Allergic or hypersensitivity reactions (rare)',
      'Peripheral edema',
      'Hypokalemia, particularly at higher doses or with insulin intensification',
    ],
    preparation:
      'Inspect the cartridge or pen — Lantus should be clear and colorless; discard if cloudy or particulate. Bring refrigerated pens to room temperature before use to reduce injection discomfort. Rotate injection sites within the abdomen, thigh, or upper arm to prevent lipodystrophy. Wash hands and clean the injection site with alcohol if recommended by your clinician.',
    recovery:
      'Resume normal activities immediately after injection. Monitor blood glucose as directed — especially before meals, at bedtime, and during physical activity — and learn to recognize and treat hypoglycemia. Notify your clinician about persistent low or high readings so the basal dose can be titrated.',
  },

  'Semaglutide (Ozempic)': {
    description:
      'Semaglutide (Ozempic) is a once-weekly GLP-1 receptor agonist used to improve glycemic control in adults with type 2 diabetes and to reduce the risk of major adverse cardiovascular events in patients with established cardiovascular disease. It is administered as a subcutaneous injection and is the same active ingredient used at higher doses in the weight-loss product Wegovy.',
    mechanism:
      'Semaglutide is a long-acting analog of glucagon-like peptide-1 (GLP-1). By binding the GLP-1 receptor, it stimulates glucose-dependent insulin secretion from pancreatic beta cells, suppresses inappropriate glucagon release, slows gastric emptying, and acts on hypothalamic satiety centers to reduce appetite — collectively lowering fasting and postprandial glucose and promoting weight loss.',
    indications: [
      'Type 2 diabetes mellitus, as an adjunct to diet and exercise to improve glycemic control',
      'Reduction of major cardiovascular events in adults with type 2 diabetes and established cardiovascular disease',
      'Patients with inadequate response to metformin or other oral antidiabetic agents',
      'Insulin-sparing therapy in type 2 diabetes',
      'Adjunctive use where weight loss is a therapeutic goal alongside glycemic control',
    ],
    sideEffects: [
      'Nausea, vomiting, and reduced appetite — most common during dose escalation',
      'Diarrhea or constipation',
      'Abdominal pain, dyspepsia, eructation',
      'Risk of acute pancreatitis (rare but serious)',
      'Boxed warning: thyroid C-cell tumors in rodents — contraindicated in personal or family history of medullary thyroid carcinoma or MEN-2 syndrome',
      'Gallbladder disease and cholelithiasis',
      'Hypoglycemia when combined with insulin or a sulfonylurea',
      'Injection-site reactions',
    ],
    preparation:
      'Store unused pens refrigerated; once in use, the pen may be kept at room temperature for the manufacturer-specified duration. Inspect the solution for clarity. Choose a site on the abdomen, thigh, or upper arm and rotate weekly. The dose is typically escalated stepwise (starting low) to minimize gastrointestinal side effects.',
    recovery:
      'No procedural recovery is required — patients self-administer at home and resume normal activity. Side effects, particularly nausea, usually diminish over several weeks. Report severe or persistent abdominal pain (possible pancreatitis), signs of gallbladder disease, or any neck mass or persistent hoarseness promptly.',
  },

  'Dulaglutide (Trulicity)': {
    description:
      'Dulaglutide (Trulicity) is a once-weekly GLP-1 receptor agonist administered as a subcutaneous injection to improve glycemic control in adults and children aged 10 years and older with type 2 diabetes. It also reduces the risk of major adverse cardiovascular events in adults with type 2 diabetes, with or without established cardiovascular disease.',
    mechanism:
      'Dulaglutide is a long-acting GLP-1 analog covalently linked to a modified human IgG4 Fc fragment, which extends its half-life to roughly five days and enables weekly dosing. Through GLP-1 receptor activation it enhances glucose-dependent insulin secretion, suppresses glucagon, delays gastric emptying, and increases satiety, lowering both fasting and postprandial blood glucose.',
    indications: [
      'Type 2 diabetes mellitus in adults and children aged 10 years and older',
      'Reduction of major adverse cardiovascular events in adults with type 2 diabetes',
      'Adjunct to metformin or other oral antidiabetic agents when monotherapy is insufficient',
      'Insulin-sparing therapy in type 2 diabetes',
      'Glycemic management when weight-neutral or weight-reducing therapy is preferred',
    ],
    sideEffects: [
      'Nausea, vomiting, and diarrhea — most common and dose-related',
      'Decreased appetite, modest weight loss',
      'Abdominal pain and dyspepsia',
      'Risk of acute pancreatitis (rare)',
      'Boxed warning: thyroid C-cell tumors in rodents — contraindicated in personal or family history of medullary thyroid carcinoma or MEN-2 syndrome',
      'Gallbladder disease, including cholelithiasis',
      'Hypoglycemia when combined with insulin or a sulfonylurea',
      'Injection-site reactions and rare hypersensitivity reactions',
    ],
    preparation:
      'Store the pre-filled pen refrigerated until use; it may be kept at room temperature for up to the period stated by the manufacturer. The single-dose autoinjector is pre-set — no measuring is required. Choose a site on the abdomen, thigh, or upper arm and rotate weekly to reduce site reactions.',
    recovery:
      'Self-administered weekly with no recovery period; resume usual activities immediately. Gastrointestinal symptoms typically improve over the first few weeks. Seek urgent care for severe abdominal pain, signs of an allergic reaction, or a new neck mass, and have routine glycemic and renal monitoring as directed.',
  },

  'Erenumab (Aimovig)': {
    description:
      'Erenumab (Aimovig) is a once-monthly subcutaneous injection used to prevent migraine attacks in adults. It was the first calcitonin gene-related peptide (CGRP) receptor antagonist approved for migraine prophylaxis and reduces monthly migraine days in both episodic and chronic migraine.',
    mechanism:
      'Erenumab is a fully human IgG2 monoclonal antibody that binds the calcitonin gene-related peptide (CGRP) receptor and blocks its activation. CGRP is a vasoactive neuropeptide that drives trigeminal pain signaling and meningeal vasodilation during migraine. By preventing CGRP from engaging its receptor on trigeminal sensory neurons and the cerebral vasculature, erenumab reduces the frequency and severity of migraine attacks over time.',
    indications: [
      'Preventive treatment of episodic migraine in adults (4–14 headache days per month)',
      'Preventive treatment of chronic migraine in adults (15 or more headache days per month)',
      'Patients who have failed, cannot tolerate, or have contraindications to traditional oral preventives (beta-blockers, topiramate, amitriptyline, candesartan)',
      'Migraine prevention where comorbidities (asthma, depression, fertility goals) limit oral options',
      'Refractory migraine managed in headache specialty clinics',
    ],
    sideEffects: [
      'Injection-site reactions: pain, redness, swelling, pruritus',
      'Constipation — may be severe, with rare reports of serious complications including obstruction',
      'Muscle cramps and spasms',
      'Hypersensitivity reactions including rash, urticaria, and angioedema (rare)',
      'New or worsening hypertension (post-marketing reports)',
      'Alopecia (uncommon)',
    ],
    preparation:
      'Store the autoinjector or prefilled syringe refrigerated; allow it to reach room temperature for about 30 minutes before injecting to reduce discomfort. Inspect the solution — it should be clear and colorless to pale yellow. Choose a clean site on the abdomen, thigh, or upper arm and rotate monthly.',
    recovery:
      'No formal recovery is needed; patients resume usual activity immediately after self-injection. Migraine frequency typically begins to decline over the first one to three months, and clinical response is assessed after about three months of consistent dosing. Report constipation that does not respond to lifestyle measures, signs of an allergic reaction, or new blood-pressure elevation to your clinician.',
  },
};

const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
let updated = 0;
for (const entry of data) {
  const patch = UPDATES[entry.name];
  if (!patch) continue;
  Object.assign(entry, patch);
  updated++;
}

if (updated !== Object.keys(UPDATES).length) {
  console.error(`Expected to update ${Object.keys(UPDATES).length} entries, updated ${updated}`);
  process.exit(1);
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`Updated ${updated} treatments in ${FILE}`);
