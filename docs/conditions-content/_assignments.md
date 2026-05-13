# Condition Content Assignments

Active claim ledger. Update this before you start writing a condition.
See `docs/condition-content-playbook.md` Section 2.

Status values: `open` → `claimed` → `drafting` → `validating` → `pr-open` → `done`

| Slug | Tier | Specialty | Assignee | Claimed | Status | Notes |
|---|---|---|---|---|---|---|
| gout | 1 | Rheumatology | claude-2026-05-12 | 2026-05-12 | done | 5,323 words, 21 FAQs, 8 PubMed citations; row 484 |
| pneumonia | 1 | Pulmonology | claude-2026-05-12 | 2026-05-12 | done | 5,160 words, 21 FAQs, 8 sources; row 485 |
| anemia | 1 | Hematology | claude-2026-05-12 | 2026-05-12 | done | 6,337 words, 22 FAQs, 10 sources; row 497 |
| heart-failure | 1 | Cardiology | claude-2026-05-12 | 2026-05-12 | done | 5,460 words, 21 FAQs, 8 sources; row 486 |
| glaucoma | 1 | Ophthalmology | claude-2026-05-12 | 2026-05-12 | done | 6,000 words, 22 FAQs, 9 sources; row 498 |
| psoriasis | 1 | Dermatology | claude-2026-05-12 | 2026-05-12 | done | 5,290 words, 21 FAQs, 8 sources; row 481 |
| sleep-apnea | 1 | Neurology/Pulmonology | claude-2026-05-12 | 2026-05-12 | done | 5,912 words, 23 FAQs, 7 sources; row 496 |
| crohns-disease | 1 | Gastroenterology | claude-2026-05-12 | 2026-05-12 | done | 6,521 words, 21 FAQs, 8 sources; row 500 |
| bipolar-disorder | 1 | Psychiatry | (open) | — | open | Tier-1 head term, 2 variants |
| celiac-disease | 1 | Gastroenterology | claude-2026-05-12 | 2026-05-12 | done | 5,413 words, 22 FAQs, 8 sources; row 501 |
| osteoarthritis | 1 | Orthopedics | claude-2026-05-12 | 2026-05-12 | done | 6,286 words, 22 FAQs, 8 sources; row 492 |
| rheumatoid-arthritis | 1 | Rheumatology | claude-2026-05-12 | 2026-05-12 | done | 6,018 words, 21 FAQs, 8 sources; row 495 |
| endometriosis | 1 | Gynecology | claude-2026-05-12 | 2026-05-12 | done | 5,853 words, 21 FAQs, 8 sources; row 499 |
| migraine | 1 | Neurology | (already exists, needs upgrade) | — | open | In seed-99; needs EEAT upgrade to v2 spec |
| hypertension | 1 | Cardiology | (already exists, needs upgrade) | — | open | In seed-99 (slug=hypertension, name "High Blood Pressure"); needs EEAT upgrade |
| back-pain | 1 | Orthopedics | (already exists, needs upgrade) | — | open | In seed-99; needs EEAT upgrade |
| diabetes-type-2 | 1 | Endocrinology | claude-2026-05-12 | 2026-05-12 | drafting | Tier-1 head term (`diabetes` → canonical slug `diabetes-type-2`); type-1-diabetes is a separate page |
| asthma | 1 | Pulmonology | claude-2026-05-12 | 2026-05-12 | done | 6,222 words, 21 FAQs, 8 sources; row 479 |
| eczema | 1 | Dermatology | claude-2026-05-12 | 2026-05-12 | done | 5,884 words, 21 FAQs, 8 sources; row 487 |
| depression | 1 | Psychiatry | claude-2026-05-12 | 2026-05-12 | done | 5,629 words, 21 FAQs, 8 sources; row 480 |
| anxiety | 1 | Psychiatry | (already exists, needs upgrade) | — | open | In seed-99 |
| gerd | 1 | Gastroenterology | claude-2026-05-12 | 2026-05-12 | done | 5,301 words, 21 FAQs, 8 sources; row 489 |

(Add more rows as you claim. See `docs/condition-tier-analysis.json` → `tier1Conditions` for the full prioritized list of 500.)

---



<!-- BATCH 002 — 100 conditions, generated 2026-05-12 -->
| allergic-contact-dermatitis | 1 | Dermatology | claude-2026-05-12 | 2026-05-12 | done | 6,690 words, 22 FAQs, 10 sources, 4 images; row 524 |
| filariasis | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 5 variants |
| schistosomiasis | 1 | Tropical Medicine | claude-2026-05-14 | 2026-05-14 | done | 5,049 words, 21 FAQs (all schemaEligible), 8 sources; row 575 |
| malaria | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | done | 7,121 words, 22 FAQs, 9 sources, 3 images; row 522 |
| tinnitus | 1 | ENT Specialist | claude-2026-05-12 | 2026-05-12 | done | 5,992 words, 22 FAQs, 8 sources; row 521 |
| fibromyalgia | 1 | Rheumatologist | claude-2026-05-12 | 2026-05-12 | done | 6,295 words, 22 FAQs, 9 sources; row 512 |
| hydrocephalus-neurosurg | 1 | Neurosurgery | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 3 variants |
| erectile-dysfunction | 1 | Urology | claude-2026-05-12 | 2026-05-12 | done | 6,614 words, 22 FAQs, 9 sources; row 510 |
| sensorineural-hearing-loss | 1 | Ophthalmology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 3 variants |
| acne | 1 | Dermatologist | claude-2026-05-12 | 2026-05-12 | done | 6,953 words, 21 FAQs, 9 sources, 3 images; row 503 |
| rosacea | 1 | Dermatologist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| vitiligo | 1 | Dermatologist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| scoliosis | 1 | Orthopedic Surgeon | claude-2026-05-12 | 2026-05-12 | done | 6,677 words, 22 FAQs, 10 sources; row 518 |
| sarcopenia | 1 | Geriatrics | claude-2026-05-12 | 2026-05-12 | done | 6,235 words, 22 FAQs, 10 sources; row 517 |
| lymphedema-rehab | 1 | Physical Medicine & Rehabilitation | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| mesothelioma | 1 | Occupational Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| otosclerosis | 1 | ENT | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| lyme-disease | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| yellow-fever | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| schizophrenia | 1 | Psychiatrist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| leishmaniasis | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| leptospirosis | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| cholesteatoma | 1 | ENT | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| farmers-lung | 1 | Pulmonology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| hyperlipidemia-family | 1 | Family Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| stress-fracture-sports | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| alport-syndrome | 1 | Genetics | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| alopecia | 1 | Dermatology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| strongyloidiasis | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| bipolar-disorder | 1 | Psychiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| plantar-fasciitis | 1 | Podiatrist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| chronic-sinusitis | 1 | Pulmonology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| multiple-sclerosis | 1 | Neurology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| cushings-syndrome | 1 | Endocrinologist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| ulcerative-colitis | 1 | Gastroenterology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| ebola-virus-disease | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| parkinsons-disease | 1 | Neurology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| alzheimers-disease | 1 | Neurology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| atrial-fibrillation | 1 | Cardiology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| trigeminal-neuralgia | 1 | Neurology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| macular-degeneration | 1 | Ophthalmology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| central-pain-syndrome | 1 | Neurology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| chronic-pain-syndrome | 1 | Neurology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| deviated-nasal-septum | 1 | Pulmonology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| peritonsillar-abscess | 1 | Pulmonology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| carpal-tunnel | 1 | Orthopedic Surgeon | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| polymyalgia-rheumatica | 1 | Orthopedics | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| eosinophilic-esophagitis | 1 | Gastroenterology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| antiphospholipid-syndrome | 1 | Hematology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| common-variable-immunodeficiency | 1 | Hematology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| abpa | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 2 variants |
| lupus | 1 | Rheumatologist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| vertigo | 1 | ENT Specialist | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| hiv-aids | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| acl-tear | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| silicosis | 1 | Occupational Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| heel-spur | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| parotitis | 1 | ENT | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| angioedema-allergy | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| meningioma | 1 | Neurosurgery | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| groin-pull | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| asbestosis | 1 | Occupational Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| zika-virus | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| hammer-toe | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| anaphylaxis | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| chikungunya | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| tuberculosis | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| dengue-fever | 1 | Infectious Disease | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| food-allergy | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| drug-allergy | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| shin-splints | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| ankle-sprain-pod | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| nasal-polyps | 1 | ENT | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| epiglottitis | 1 | ENT | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| polymyositis | 1 | Rheumatology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| charcot-foot | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| latex-allergy | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| prenatal-care | 1 | Family Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| meniscus-tear | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| metatarsalgia | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| serum-sickness | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| chagas-disease | 1 | Tropical Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| behcet-disease | 1 | Rheumatology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| iga-nephropathy | 1 | Nephrology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| lupus-nephritis | 1 | Nephrology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| whiplash-injury | 1 | Physical Medicine & Rehabilitation | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| allergic-asthma | 1 | Allergy & Immunology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| ingrown-toenail | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| meniere-disease | 1 | ENT | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| dermatomyositis | 1 | Rheumatology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| frailty-syndrome | 1 | Geriatrics | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| falls-in-elderly | 1 | Geriatrics | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| neuropathic-pain | 1 | Pain Medicine & Palliative Care | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| hamstring-strain | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| muscle-contusion | 1 | Sports Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| burnout-syndrome | 1 | Occupational Medicine | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| mortons-neuroma | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | done | 6,135 words, 22 FAQs, 10 sources; row 520. ⚠ link-check pending (cited from training data, not live-verified) |
| gout-podiatric | 1 | Podiatry | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |
| laryngeal-cancer | 1 | ENT | claude-2026-05-12 | 2026-05-12 | done | 6,932 words, 22 FAQs, 9 sources; row 519. ⚠ link-check pending (cited from training data, not live-verified) |
| sjogren-syndrome | 1 | Rheumatology | claude-2026-05-12 | 2026-05-12 | claimed | Batch 002, 1 variant |





<!-- BATCH 003 — 68 conditions, generated 2026-05-12 -->
| intractable-pain | 1 | Pain Medicine & Palliative Care | (open) | — | open | Batch 003, 1 variant |
| chronic-urticaria | 1 | Allergy & Immunology | (open) | — | open | Batch 003, 1 variant |
| phantom-limb-pain | 1 | Pain Medicine & Palliative Care | (open) | — | open | Batch 003, 1 variant |
| breakthrough-pain | 1 | Pain Medicine & Palliative Care | (open) | — | open | Batch 003, 1 variant |
| well-child-visits | 1 | Family Medicine | (open) | — | open | Batch 003, 1 variant |
| cerebral-aneurysm | 1 | Neurosurgery | (open) | — | open | Batch 003, 1 variant |
| pituitary-adenoma | 1 | Neurosurgery | (open) | — | open | Batch 003, 1 variant |
| subdural-hematoma | 1 | Neurosurgery | (open) | — | open | Batch 003, 1 variant |
| epidural-hematoma | 1 | Neurosurgery | (open) | — | open | Batch 003, 1 variant |
| labral-tear-hip | 1 | Sports Medicine | (open) | — | open | Batch 003, 1 variant |
| sleep-apnea-ent | 1 | ENT | (open) | — | open | Batch 003, 1 variant |
| nephrotic-syndrome | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| nephritic-syndrome | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| obesity-management | 1 | Family Medicine | (open) | — | open | Batch 003, 1 variant |
| hookworm-infection | 1 | Tropical Medicine | (open) | — | open | Batch 003, 1 variant |
| vocal-cord-nodules | 1 | ENT | (open) | — | open | Batch 003, 1 variant |
| reactive-arthritis | 1 | Rheumatology | (open) | — | open | Batch 003, 1 variant |
| raynaud-phenomenon | 1 | Rheumatology | (open) | — | open | Batch 003, 1 variant |
| delirium-in-elderly | 1 | Geriatrics | (open) | — | open | Batch 003, 1 variant |
| senile-osteoporosis | 1 | Geriatrics | (open) | — | open | Batch 003, 1 variant |
| sundowning-syndrome | 1 | Geriatrics | (open) | — | open | Batch 003, 1 variant |
| chiari-malformation | 1 | Neurosurgery | (open) | — | open | Batch 003, 1 variant |
| occupational-asthma | 1 | Occupational Medicine | (open) | — | open | Batch 003, 1 variant |
| diabetic-foot-ulcer | 1 | Podiatry | (open) | — | open | Batch 003, 1 variant |
| achilles-tendinitis | 1 | Podiatry | (open) | — | open | Batch 003, 1 variant |
| psoriatic-arthritis | 1 | Rheumatology | (open) | — | open | Batch 003, 1 variant |
| diabetic-nephropathy | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| renal-cell-carcinoma | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| goodpasture-syndrome | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| elder-abuse-syndrome | 1 | Geriatrics | (open) | — | open | Batch 003, 1 variant |
| geriatric-depression | 1 | Geriatrics | (open) | — | open | Batch 003, 1 variant |
| lumbar-radiculopathy | 1 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 003, 1 variant |
| insect-venom-allergy | 1 | Allergy & Immunology | (open) | — | open | Batch 003, 1 variant |
| brain-tumor-glioma | 1 | Neurosurgery | (open) | — | open | Batch 003, 1 variant |
| concussion-in-sports | 1 | Sports Medicine | (open) | — | open | Batch 003, 1 variant |
| vocal-cord-paralysis | 1 | ENT | (open) | — | open | Batch 003, 1 variant |
| giant-cell-arteritis | 1 | Rheumatology | (open) | — | open | Batch 003, 1 variant |
| vesicoureteral-reflux | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| chronic-low-back-pain | 1 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 003, 1 variant |
| spasticity-management | 1 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 003, 1 variant |
| hereditary-angioedema | 1 | Allergy & Immunology | (open) | — | open | Batch 003, 1 variant |
| overtraining-syndrome | 1 | Sports Medicine | (open) | — | open | Batch 003, 1 variant |
| salivary-gland-stones | 1 | ENT | (open) | — | open | Batch 003, 1 variant |
| renal-tubular-acidosis | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| membranous-nephropathy | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| minimal-change-disease | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| interstitial-nephritis | 1 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| geriatric-malnutrition | 1 | Geriatrics | (open) | — | open | Batch 003, 1 variant |
| cervical-radiculopathy | 1 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 003, 1 variant |
| cancer-pain-management | 1 | Pain Medicine & Palliative Care | (open) | — | open | Batch 003, 1 variant |
| postherpetic-neuralgia | 1 | Pain Medicine & Palliative Care | (open) | — | open | Batch 003, 1 variant |
| labral-tear-shoulder | 1 | Sports Medicine | (open) | — | open | Batch 003, 1 variant |
| bunion-hallux-valgus | 1 | Podiatry | (open) | — | open | Batch 003, 1 variant |
| flat-feet-pes-planus | 1 | Podiatry | (open) | — | open | Batch 003, 1 variant |
| tarsal-tunnel-syndrome | 1 | Podiatry | (open) | — | open | Batch 003, 1 variant |
| chronic-otitis-media | 1 | ENT | (open) | — | open | Batch 003, 1 variant |
| ankylosing-spondylitis | 1 | Rheumatology | (open) | — | open | Batch 003, 1 variant |
| achilles-tendon-rupture | 1 | Sports Medicine | (open) | — | open | Batch 003, 1 variant |
| exercise-induced-asthma | 1 | Sports Medicine | (open) | — | open | Batch 003, 1 variant |
| occupational-dermatitis | 1 | Occupational Medicine | (open) | — | open | Batch 003, 1 variant |
| chronic-kidney-disease-stage-1 | 2 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| chronic-kidney-disease-stage-2 | 2 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| chronic-kidney-disease-stage-3 | 2 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| chronic-kidney-disease-stage-4 | 2 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| chronic-kidney-disease-stage-5-esrd | 2 | Nephrology | (open) | — | open | Batch 003, 1 variant |
| end-of-life-symptom-management | 2 | Pain Medicine & Palliative Care | (open) | — | open | Batch 003, 1 variant |
| type-2-diabetes-primary-care | 2 | Family Medicine | (open) | — | open | Batch 003, 1 variant |
| urinary-tract-infection-primary-care | 2 | Family Medicine | (open) | — | open | Batch 003, 1 variant |




<!-- BATCH 004 — 100 conditions, generated 2026-05-12 -->
| aaa-screening | 3 | Radiology | (open) | — | open | Batch 004, 1 variant |
| abdominoplasty | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| acoustic-neuroma | 3 | Neurosurgery | (open) | — | open | Batch 004, 1 variant |
| adhd | 3 | Psychiatrist | (open) | — | open | Batch 004, 1 variant |
| presbycusis | 3 | Geriatrics | (open) | — | open | Batch 004, 1 variant |
| age-related-macular-degeneration | 3 | Geriatrics | (open) | — | open | Batch 004, 1 variant |
| allergic-rhinitis-hay-fever | 3 | Allergy & Immunology | (open) | — | open | Batch 004, 1 variant |
| amputation-rehabilitation | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 004, 1 variant |
| anxiety-disorder-primary-care | 3 | Family Medicine | (open) | — | open | Batch 004, 1 variant |
| aortic-aneurysm-repair | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| aortic-calcification | 3 | Radiology | (open) | — | open | Batch 004, 1 variant |
| av-fistula-creation-dialysis | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| arteriovenous-malformation | 3 | Neurosurgery | (open) | — | open | Batch 004, 1 variant |
| atopic-dermatitis-eczema | 3 | Allergy & Immunology | (open) | — | open | Batch 004, 1 variant |
| atrial-septal-defect-repair | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| blepharoplasty | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| bone-marrow-biopsy-evaluation | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |
| bone-metastasis-imaging | 3 | Nuclear Medicine | (open) | — | open | Batch 004, 1 variant |
| breast-cancer | 3 | Oncologist | (open) | — | open | Batch 004, 1 variant |
| breast-cancer-histopathology | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |
| breast-reconstruction | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| burn-scar-contracture | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| cppd-disease | 3 | Rheumatology | (open) | — | open | Batch 004, 1 variant |
| cancer-screening-programs | 3 | Preventive & Public Health | (open) | — | open | Batch 004, 1 variant |
| caregiver-burnout-syndrome | 3 | Pain Medicine & Palliative Care | (open) | — | open | Batch 004, 1 variant |
| carotid-endarterectomy | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| carpal-tunnel-syndrome-rehab | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 004, 1 variant |
| carpal-tunnel-syndrome-occupational | 3 | Occupational Medicine | (open) | — | open | Batch 004, 1 variant |
| cataracts | 3 | Ophthalmologist | (open) | — | open | Batch 004, 1 variant |
| cervical-dysplasia-pap | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |
| chemical-burns-occupational | 3 | Occupational Medicine | (open) | — | open | Batch 004, 1 variant |
| childhood-immunization-schedules | 3 | Family Medicine | (open) | — | open | Batch 004, 1 variant |
| chronic-disease-management | 3 | Family Medicine | (open) | — | open | Batch 004, 1 variant |
| chronic-fatigue-syndrome | 3 | Internal Medicine | (open) | — | open | Batch 004, 1 variant |
| chronic-migraine-pain-management | 3 | Pain Medicine & Palliative Care | (open) | — | open | Batch 004, 1 variant |
| cleft-lip-and-palate | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 004, 1 variant |
| coal-workers-pneumoconiosis | 3 | Occupational Medicine | (open) | — | open | Batch 004, 1 variant |
| colon-polyp-histology | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |
| colorectal-cancer | 3 | Oncologist | (open) | — | open | Batch 004, 1 variant |
| communicable-disease-control | 3 | Preventive & Public Health | (open) | — | open | Batch 004, 1 variant |
| complex-regional-pain-syndrome | 3 | Pain Medicine & Palliative Care | (open) | — | open | Batch 004, 1 variant |
| copd | 3 | Pulmonologist | (open) | — | open | Batch 004, 1 variant |
| coronary-artery-bypass-grafting | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| coronary-artery-calcium-score | 3 | Radiology | (open) | — | open | Batch 004, 1 variant |
| coronary-artery-disease | 3 | Cardiologist | (open) | — | open | Batch 004, 1 variant |
| craniofacial-surgery | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| craniosynostosis | 3 | Neurosurgery | (open) | — | open | Batch 004, 1 variant |
| de-quervain-tenosynovitis | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 004, 1 variant |
| deep-brain-stimulation-parkinsons | 3 | Neurosurgery | (open) | — | open | Batch 004, 1 variant |
| dental-abscess | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 004, 1 variant |
| dentigerous-cyst | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 004, 1 variant |
| diabetic-retinopathy | 3 | Ophthalmologist | (open) | — | open | Batch 004, 1 variant |
| disaster-medicine | 3 | Preventive & Public Health | (open) | — | open | Batch 004, 1 variant |
| endovascular-aneurysm-repair | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| bph | 3 | Urologist | (open) | — | open | Batch 004, 1 variant |
| epidemiological-surveillance | 3 | Preventive & Public Health | (open) | — | open | Batch 004, 1 variant |
| epilepsy | 3 | Neurologist | (open) | — | open | Batch 004, 1 variant |
| epistaxis-recurrent | 3 | ENT | (open) | — | open | Batch 004, 1 variant |
| facial-trauma-reconstruction | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 004, 1 variant |
| failed-back-surgery-syndrome | 3 | Pain Medicine & Palliative Care | (open) | — | open | Batch 004, 1 variant |
| failure-to-thrive-elderly | 3 | Geriatrics | (open) | — | open | Batch 004, 1 variant |
| fibromyalgia-rheum | 3 | Rheumatology | (open) | — | open | Batch 004, 1 variant |
| fibromyalgia-rehabilitation | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 004, 1 variant |
| focal-segmental-glomerulosclerosis | 3 | Nephrology | (open) | — | open | Batch 004, 1 variant |
| frozen-section-analysis | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |
| frozen-shoulder-adhesive-capsulitis | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 004, 1 variant |
| fungal-toenail-onychomycosis | 3 | Podiatry | (open) | — | open | Batch 004, 1 variant |
| gallium-scan-infection | 3 | Nuclear Medicine | (open) | — | open | Batch 004, 1 variant |
| gallstones | 3 | Gastroenterologist | (open) | — | open | Batch 004, 1 variant |
| gout-rheum | 3 | Rheumatology | (open) | — | open | Batch 004, 1 variant |
| graves-disease-nuclear | 3 | Nuclear Medicine | (open) | — | open | Batch 004, 1 variant |
| gynecomastia-surgery | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| hand-reconstruction | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| hashimotos-disease | 3 | Endocrinologist | (open) | — | open | Batch 004, 1 variant |
| heart-transplant | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| heart-valve-replacement | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 004, 1 variant |
| exertional-heat-stroke | 3 | Sports Medicine | (open) | — | open | Batch 004, 1 variant |
| hemolytic-uremic-syndrome | 3 | Nephrology | (open) | — | open | Batch 004, 1 variant |
| hepatitis-b | 3 | Gastroenterologist | (open) | — | open | Batch 004, 1 variant |
| hepatitis-c | 3 | Gastroenterologist | (open) | — | open | Batch 004, 1 variant |
| herniated-disc-mri | 3 | Radiology | (open) | — | open | Batch 004, 1 variant |
| herniated-disc-surgical | 3 | Neurosurgery | (open) | — | open | Batch 004, 1 variant |
| hiv-aids-prevention | 3 | Preventive & Public Health | (open) | — | open | Batch 004, 1 variant |
| hives | 3 | Dermatologist | (open) | — | open | Batch 004, 1 variant |
| hypertension-primary-care | 3 | Family Medicine | (open) | — | open | Batch 004, 1 variant |
| hypertensive-nephrosclerosis | 3 | Nephrology | (open) | — | open | Batch 004, 1 variant |
| impacted-wisdom-teeth | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 004, 1 variant |
| interventional-radiology | 3 | Radiology | (open) | — | open | Batch 004, 1 variant |
| ibs | 3 | Gastroenterologist | (open) | — | open | Batch 004, 1 variant |
| jaw-fracture-mandibular | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 004, 1 variant |
| keloid-treatment | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| kidney-biopsy-glomerulonephritis | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |
| kidney-stones | 3 | Urologist | (open) | — | open | Batch 004, 1 variant |
| nephrolithiasis | 3 | Nephrology | (open) | — | open | Batch 004, 1 variant |
| laryngopharyngeal-reflux | 3 | ENT | (open) | — | open | Batch 004, 1 variant |
| lead-poisoning-occupational | 3 | Occupational Medicine | (open) | — | open | Batch 004, 1 variant |
| leprosy-hansen-disease | 3 | Tropical Medicine | (open) | — | open | Batch 004, 1 variant |
| leukemia | 3 | Oncologist | (open) | — | open | Batch 004, 1 variant |
| liposuction | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 004, 1 variant |
| liver-biopsy-interpretation | 3 | Pathology | (open) | — | open | Batch 004, 1 variant |



<!-- BATCH 005 — 100 conditions, generated 2026-05-12 -->
| liver-hemangioma | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| ludwig-angina | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| lung-cancer | 3 | Oncologist | (open) | — | open | Batch 005, 1 variant |
| lung-nodule-incidental | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| lung-transplant | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| lymph-node-biopsy-pathology | 3 | Pathology | (open) | — | open | Batch 005, 1 variant |
| lymphoma | 3 | Oncologist | (open) | — | open | Batch 005, 1 variant |
| malaria-tropical | 3 | Tropical Medicine | (open) | — | open | Batch 005, 1 variant |
| malocclusion-orthognathic | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| mammographic-breast-lesion | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| mast-cell-activation-syndrome | 3 | Allergy & Immunology | (open) | — | open | Batch 005, 1 variant |
| maternal-and-child-health | 3 | Preventive & Public Health | (open) | — | open | Batch 005, 1 variant |
| melanoma | 3 | Oncologist | (open) | — | open | Batch 005, 1 variant |
| melanoma-pathology-staging | 3 | Pathology | (open) | — | open | Batch 005, 1 variant |
| microsurgery-free-flap | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 005, 1 variant |
| microtia-repair | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 005, 1 variant |
| minimally-invasive-cardiac-surgery | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| mixed-connective-tissue-disease | 3 | Rheumatology | (open) | — | open | Batch 005, 1 variant |
| molecular-pathology-testing | 3 | Pathology | (open) | — | open | Batch 005, 1 variant |
| myocardial-perfusion-imaging | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| myofascial-pain-syndrome | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| nasopharyngeal-carcinoma | 3 | ENT | (open) | — | open | Batch 005, 1 variant |
| neuroendocrine-tumor-imaging | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| noise-induced-hearing-loss | 3 | Occupational Medicine | (open) | — | open | Batch 005, 1 variant |
| nutritional-deficiency-screening | 3 | Preventive & Public Health | (open) | — | open | Batch 005, 1 variant |
| obesity-prevention | 3 | Preventive & Public Health | (open) | — | open | Batch 005, 1 variant |
| occupational-health-screening | 3 | Preventive & Public Health | (open) | — | open | Batch 005, 1 variant |
| odontogenic-infection | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| opioid-induced-hyperalgesia | 3 | Pain Medicine & Palliative Care | (open) | — | open | Batch 005, 1 variant |
| oral-cancer | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| orofacial-pain | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| osteoarthritis-primary-care | 3 | Family Medicine | (open) | — | open | Batch 005, 1 variant |
| osteoarthritis-rheum | 3 | Rheumatology | (open) | — | open | Batch 005, 1 variant |
| osteonecrosis-of-jaw | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| osteoporosis | 3 | Endocrinologist | (open) | — | open | Batch 005, 1 variant |
| ovarian-cyst-ultrasound | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| hyperthyroidism | 3 | Endocrinologist | (open) | — | open | Batch 005, 1 variant |
| pcos | 3 | Endocrinologist | (open) | — | open | Batch 005, 1 variant |
| pelvic-inflammatory-disease | 3 | Gynecologist | (open) | — | open | Batch 005, 1 variant |
| peptic-ulcer | 3 | Gastroenterologist | (open) | — | open | Batch 005, 1 variant |
| peripheral-artery-disease-surgical | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| pet-ct-lymphoma-staging | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| plantar-fasciitis-pod | 3 | Podiatry | (open) | — | open | Batch 005, 1 variant |
| polycystic-kidney-disease | 3 | Nephrology | (open) | — | open | Batch 005, 1 variant |
| polypharmacy-complications | 3 | Geriatrics | (open) | — | open | Batch 005, 1 variant |
| post-stroke-rehabilitation | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| pressure-ulcers-bedsores | 3 | Geriatrics | (open) | — | open | Batch 005, 1 variant |
| preventive-health-screening | 3 | Family Medicine | (open) | — | open | Batch 005, 1 variant |
| prostate-biopsy-analysis | 3 | Pathology | (open) | — | open | Batch 005, 1 variant |
| prostate-cancer | 3 | Oncologist | (open) | — | open | Batch 005, 1 variant |
| ptsd | 3 | Psychiatrist | (open) | — | open | Batch 005, 1 variant |
| radioactive-iodine-ablation | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| ranula | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| renal-artery-stenosis | 3 | Nephrology | (open) | — | open | Batch 005, 1 variant |
| renal-function-scintigraphy | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| renal-mass-ct-finding | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| rhinoplasty | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 005, 1 variant |
| rotator-cuff-tendinopathy | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| runners-knee | 3 | Sports Medicine | (open) | — | open | Batch 005, 1 variant |
| salivary-gland-tumor | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| scar-revision | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 005, 1 variant |
| sciatica | 3 | Orthopedic Surgeon | (open) | — | open | Batch 005, 1 variant |
| scleroderma-systemic-sclerosis | 3 | Rheumatology | (open) | — | open | Batch 005, 1 variant |
| selective-iga-deficiency | 3 | Allergy & Immunology | (open) | — | open | Batch 005, 1 variant |
| sentinel-lymph-node-mapping | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| shift-work-sleep-disorder | 3 | Occupational Medicine | (open) | — | open | Batch 005, 1 variant |
| skin-grafting | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 005, 1 variant |
| smoking-cessation-counseling | 3 | Family Medicine | (open) | — | open | Batch 005, 1 variant |
| spinal-cord-injury-rehabilitation | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| spinal-stenosis-surgical | 3 | Neurosurgery | (open) | — | open | Batch 005, 1 variant |
| stroke-imaging | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| systemic-lupus-erythematosus | 3 | Rheumatology | (open) | — | open | Batch 005, 1 variant |
| tennis-elbow-lateral-epicondylitis | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| thoracic-aortic-dissection | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| thoracotomy-lung-cancer | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| thyroid-cancer-radioiodine | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| thyroid-fna-cytology | 3 | Pathology | (open) | — | open | Batch 005, 1 variant |
| thyroid-nodule-evaluation | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| thyroid-ultrasound-findings | 3 | Radiology | (open) | — | open | Batch 005, 1 variant |
| tinnitus-ent | 3 | ENT | (open) | — | open | Batch 005, 1 variant |
| tissue-expansion | 3 | Plastic & Reconstructive Surgery | (open) | — | open | Batch 005, 1 variant |
| tmj-disorder | 3 | Maxillofacial & Oral Surgery | (open) | — | open | Batch 005, 1 variant |
| tobacco-cessation-programs | 3 | Preventive & Public Health | (open) | — | open | Batch 005, 1 variant |
| tbi-rehabilitation | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| travel-medicine-consultations | 3 | Family Medicine | (open) | — | open | Batch 005, 1 variant |
| trigeminal-neuralgia-surgical | 3 | Neurosurgery | (open) | — | open | Batch 005, 1 variant |
| african-trypanosomiasis | 3 | Tropical Medicine | (open) | — | open | Batch 005, 1 variant |
| type-1-diabetes | 3 | Endocrinologist | (open) | — | open | Batch 005, 1 variant |
| diabetes-type-2 | 3 | Endocrinologist | (open) | — | open | Batch 005, 1 variant |
| hypothyroidism | 3 | Endocrinologist | (open) | — | open | Batch 005, 1 variant |
| upper-respiratory-infection | 3 | Family Medicine | (open) | — | open | Batch 005, 1 variant |
| urinary-incontinence-elderly | 3 | Geriatrics | (open) | — | open | Batch 005, 1 variant |
| fibroids | 3 | Gynecologist | (open) | — | open | Batch 005, 1 variant |
| vaccination-programs | 3 | Preventive & Public Health | (open) | — | open | Batch 005, 1 variant |
| varicose-vein-surgery | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| anca-vasculitis | 3 | Rheumatology | (open) | — | open | Batch 005, 1 variant |
| ventilation-perfusion-scan | 3 | Nuclear Medicine | (open) | — | open | Batch 005, 1 variant |
| ventricular-assist-device | 3 | Cardiothoracic & Vascular Surgery | (open) | — | open | Batch 005, 1 variant |
| vestibular-rehabilitation | 3 | Physical Medicine & Rehabilitation | (open) | — | open | Batch 005, 1 variant |
| vibration-white-finger | 3 | Occupational Medicine | (open) | — | open | Batch 005, 1 variant |



<!-- BATCH 006 — 2 conditions, generated 2026-05-12 -->
| water-sanitation-disease | 3 | Preventive & Public Health | (open) | — | open | Batch 006, 1 variant |
| work-related-musculoskeletal-disorder | 3 | Occupational Medicine | (open) | — | open | Batch 006, 1 variant |

<!-- BATCH 007 — 100 conditions, generated 2026-05-12 -->
| hemochromatosis-unspecified-e83119 | 1 | Endocrinology | (open) | — | open | Batch 007, 2 variants |
| neonatal-encephalopathy-unspecified-p91819 | 1 | Neonatology | (open) | — | open | Batch 007, 2 variants |
| cowpox-b08010 | 1 | Infectious Disease | (open) | — | open | Batch 007, 1 variant |
| pouchitis-k91850 | 1 | Gastroenterology | (open) | — | open | Batch 007, 1 variant |
| vulvodynia-unspecified-n94819 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| hypopyon-unspecified-eye-h20059 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| chalcosis-unspecified-eye-h44319 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| arcuate-uterus-q51810 | 1 | Genetics | (open) | — | open | Batch 007, 1 variant |
| diplacusis-unspecified-ear-h93229 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| panuveitis-unspecified-eye-h44119 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| leucocoria-unspecified-eye-h44539 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| pinguecula-unspecified-eye-h11159 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| lymphocytopenia-d72810 | 1 | Hematology | (open) | — | open | Batch 007, 1 variant |
| facial-weakness-r29810 | 1 | General Medicine | (open) | — | open | Batch 007, 1 variant |
| ocular-albinism-unspecified-e70319 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| hyperacusis-unspecified-ear-h93239 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| iridoschisis-unspecified-eye-h21259 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| symblepharon-unspecified-eye-h11239 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| castleman-disease-d47z2 | 1 | Hematology | (open) | — | open | Batch 007, 1 variant |
| keratomalacia-unspecified-eye-h18449 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| descemetocele-unspecified-eye-h18739 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| iridodialysis-unspecified-eye-h21539 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| hemophthalmos-unspecified-eye-h44819 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| pingueculitis-unspecified-eye-h10819 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| propionic-acidemia-e71121 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| zellweger-syndrome-e71510 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| ocular-torticollis-r29891 | 1 | General Medicine | (open) | — | open | Batch 007, 1 variant |
| suicidal-ideations-r45851 | 1 | General Medicine | (open) | — | open | Batch 007, 1 variant |
| photokeratitis-unspecified-eye-h16139 | 1 | Ophthalmology | (open) | — | open | Batch 007, 1 variant |
| histiocytic-sarcoma-c96a | 1 | Oncology | (open) | — | open | Batch 007, 1 variant |
| acquired-hemophilia-d68311 | 1 | Hematology | (open) | — | open | Batch 007, 1 variant |
| isovaleric-acidemia-e71110 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| collagenous-colitis-k52831 | 1 | Gastroenterology | (open) | — | open | Batch 007, 1 variant |
| lymphocytic-colitis-k52832 | 1 | Gastroenterology | (open) | — | open | Batch 007, 1 variant |
| coital-incontinence-n39491 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| vulvar-vestibulitis-n94810 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| psychomotor-deficit-r41843 | 1 | General Medicine | (open) | — | open | Batch 007, 1 variant |
| homicidal-ideations-r45850 | 1 | General Medicine | (open) | — | open | Batch 007, 1 variant |
| microscopic-colitis-unspecified-k52839 | 1 | Gastroenterology | (open) | — | open | Batch 007, 1 variant |
| cough-variant-asthma-j45991 | 1 | Pulmonology | (open) | — | open | Batch 007, 1 variant |
| cystostomy-infection-n99511 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| hypoplasia-of-uterus-q51811 | 1 | Genetics | (open) | — | open | Batch 007, 1 variant |
| cervical-duplication-q51820 | 1 | Genetics | (open) | — | open | Batch 007, 1 variant |
| hypoplasia-of-cervix-q51821 | 1 | Genetics | (open) | — | open | Batch 007, 1 variant |
| visuospatial-deficit-r41842 | 1 | General Medicine | (open) | — | open | Batch 007, 1 variant |
| adrenomyeloneuropathy-e71522 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| overflow-incontinence-n39490 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| cystostomy-hemorrhage-n99510 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| biotinidase-deficiency-d81810 | 1 | Hematology | (open) | — | open | Batch 007, 1 variant |
| methylmalonic-acidemia-e71120 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| periorbital-cellulitis-l03213 | 1 | Dermatology | (open) | — | open | Batch 007, 1 variant |
| cystostomy-malfunction-n99512 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| postural-urinary-incontinence-n39492 | 1 | Urology | (open) | — | open | Batch 007, 1 variant |
| zellweger-like-syndrome-e71541 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| thoracic-aortic-ectasia-i77810 | 1 | Cardiology | (open) | — | open | Batch 007, 1 variant |
| oculocutaneous-albinism-unspecified-e70329 | 1 | Endocrinology | (open) | — | open | Batch 007, 1 variant |
| acute-bronchitis-unspecified-j209 | 2 | Pulmonology | (open) | — | open | Batch 007, 10 variants |
| congenital-pneumonia-unspecified-p239 | 2 | Neonatology | (open) | — | open | Batch 007, 9 variants |
| neonatal-jaundice-unspecified-p599 | 2 | Neonatology | (open) | — | open | Batch 007, 9 variants |
| shigellosis-unspecified-a039 | 2 | Infectious Disease | (open) | — | open | Batch 007, 5 variants |
| brucellosis-unspecified-a239 | 2 | Infectious Disease | (open) | — | open | Batch 007, 5 variants |
| spotted-fever-unspecified-a779 | 2 | Infectious Disease | (open) | — | open | Batch 007, 5 variants |
| dermatitis-unspecified-l309 | 2 | Dermatology | (open) | — | open | Batch 007, 5 variants |
| oral-mucositis-ulcerative-unspecified-k1230 | 2 | Gastroenterology | (open) | — | open | Batch 007, 4 variants |
| acute-bronchiolitis-unspecified-j219 | 2 | Pulmonology | (open) | — | open | Batch 007, 4 variants |
| assault-by-unspecified-means-y09 | 2 | General Medicine | (open) | — | open | Batch 007, 4 variants |
| meningitis-unspecified-g039 | 2 | Neurology | (open) | — | open | Batch 007, 3 variants |
| typhus-fever-unspecified-a759 | 2 | Infectious Disease | (open) | — | open | Batch 007, 3 variants |
| pediculosis-unspecified-b852 | 2 | Infectious Disease | (open) | — | open | Batch 007, 3 variants |
| pulmonary-hypertension-unspecified-i2720 | 2 | Cardiology | (open) | — | open | Batch 007, 3 variants |
| cholera-unspecified-a009 | 2 | Infectious Disease | (open) | — | open | Batch 007, 3 variants |
| exanthema-subitum-sixth-disease-unspecified-b0820 | 2 | Infectious Disease | (open) | — | open | Batch 007, 3 variants |
| hypothyroidism-unspecified-e039 | 2 | Endocrinology | (open) | — | open | Batch 007, 3 variants |
| insomnia-unspecified-g4700 | 2 | Psychiatry | (open) | — | open | Batch 007, 3 variants |
| hypersomnia-unspecified-g4710 | 2 | Psychiatry | (open) | — | open | Batch 007, 3 variants |
| polyneuropathy-unspecified-g629 | 2 | Neurology | (open) | — | open | Batch 007, 3 variants |
| myopathy-unspecified-g729 | 2 | Neurology | (open) | — | open | Batch 007, 3 variants |
| cardiomyopathy-unspecified-i429 | 2 | Cardiology | (open) | — | open | Batch 007, 3 variants |
| adult-osteomalacia-unspecified-m839 | 2 | Orthopedics | (open) | — | open | Batch 007, 3 variants |
| priapism-unspecified-n4830 | 2 | Urology | (open) | — | open | Batch 007, 3 variants |
| kernicterus-unspecified-p579 | 2 | Neonatology | (open) | — | open | Batch 007, 3 variants |
| benign-lipomatous-neoplasm-of-skin-subcu-of-sites-d1739 | 2 | Hematology | (open) | — | open | Batch 007, 2 variants |
| cerebral-edema-g936 | 2 | Neurology | (open) | — | open | Batch 007, 2 variants |
| ulceration-of-vulva-n766 | 2 | Urology | (open) | — | open | Batch 007, 2 variants |
| hemoglobinuria-r823 | 2 | General Medicine | (open) | — | open | Batch 007, 2 variants |
| zoster-without-complications-b029 | 2 | Infectious Disease | (open) | — | open | Batch 007, 2 variants |
| ascariasis-with-other-complications-b7789 | 2 | Infectious Disease | (open) | — | open | Batch 007, 2 variants |
| urticaria-unspecified-l509 | 2 | Dermatology | (open) | — | open | Batch 007, 2 variants |
| rickettsiosis-unspecified-a799 | 2 | Infectious Disease | (open) | — | open | Batch 007, 2 variants |
| rubella-without-complication-b069 | 2 | Infectious Disease | (open) | — | open | Batch 007, 2 variants |
| aplastic-anemia-unspecified-d619 | 2 | Hematology | (open) | — | open | Batch 007, 2 variants |
| neutropenia-unspecified-d709 | 2 | Hematology | (open) | — | open | Batch 007, 2 variants |
| nontoxic-goiter-unspecified-e049 | 2 | Endocrinology | (open) | — | open | Batch 007, 2 variants |
| short-stature-child-r6252 | 2 | Endocrinology | (open) | — | open | Batch 007, 2 variants |
| albinism-unspecified-e7030 | 2 | Endocrinology | (open) | — | open | Batch 007, 2 variants |
| anxiety-disorder-unspecified-f419 | 2 | Psychiatry | (open) | — | open | Batch 007, 2 variants |
| eating-disorder-unspecified-f509 | 2 | Psychiatry | (open) | — | open | Batch 007, 2 variants |
| attention-deficit-hyperactivity-disorder-other-type-f908 | 2 | Psychiatry | (open) | — | open | Batch 007, 2 variants |
| secondary-parkinsonism-unspecified-g219 | 2 | Neurology | (open) | — | open | Batch 007, 2 variants |
| mononeuropathy-unspecified-g589 | 2 | Neurology | (open) | — | open | Batch 007, 2 variants |



<!-- BATCH 008 — 100 conditions, generated 2026-05-12 -->
| noninfective-disorders-of-pinna-unspecified-ear-h61199 | 2 | Ophthalmology | (open) | — | open | Batch 008, 2 variants |
| acute-mastoiditis-without-complications-unspecified-ear-h70009 | 2 | Ophthalmology | (open) | — | open | Batch 008, 2 variants |
| myocarditis-unspecified-i514 | 2 | Cardiology | (open) | — | open | Batch 008, 2 variants |
| dissection-of-unspecified-artery-i7770 | 2 | Cardiology | (open) | — | open | Batch 008, 2 variants |
| acute-pharyngitis-unspecified-j029 | 2 | Pulmonology | (open) | — | open | Batch 008, 2 variants |
| acute-tonsillitis-unspecified-j0390 | 2 | Pulmonology | (open) | — | open | Batch 008, 2 variants |
| acute-recurrent-tonsillitis-unspecified-j0391 | 2 | Pulmonology | (open) | — | open | Batch 008, 2 variants |
| hypotension-unspecified-i959 | 2 | Cardiology | (open) | — | open | Batch 008, 2 variants |
| crohn-s-disease-of-small-intestine-with-unsp-complications-k50019 | 2 | Gastroenterology | (open) | — | open | Batch 008, 2 variants |
| crohn-s-disease-of-large-intestine-with-unsp-complications-k50119 | 2 | Gastroenterology | (open) | — | open | Batch 008, 2 variants |
| ulcerative-chronic-pancolitis-with-unsp-complications-k51019 | 2 | Gastroenterology | (open) | — | open | Batch 008, 2 variants |
| ulcerative-chronic-proctitis-with-unsp-complications-k51219 | 2 | Gastroenterology | (open) | — | open | Batch 008, 2 variants |
| noninfective-gastroenteritis-and-colitis-unspecified-k529 | 2 | Gastroenterology | (open) | — | open | Batch 008, 2 variants |
| epidermolysis-bullosa-unspecified-q819 | 2 | Dermatology | (open) | — | open | Batch 008, 2 variants |
| nonscarring-hair-loss-unspecified-l659 | 2 | Dermatology | (open) | — | open | Batch 008, 2 variants |
| epidermal-thickening-unspecified-l859 | 2 | Dermatology | (open) | — | open | Batch 008, 2 variants |
| polyarthritis-unspecified-m130 | 2 | Orthopedics | (open) | — | open | Batch 008, 2 variants |
| varus-deformity-not-elsewhere-classified-unspecified-m21159 | 2 | Orthopedics | (open) | — | open | Batch 008, 2 variants |
| spontaneous-rupture-of-other-tendons-other-m6688 | 2 | Orthopedics | (open) | — | open | Batch 008, 2 variants |
| juvenile-osteochondrosis-unspecified-m929 | 2 | Orthopedics | (open) | — | open | Batch 008, 2 variants |
| irregular-menstruation-unspecified-n926 | 2 | Urology | (open) | — | open | Batch 008, 2 variants |
| abnormal-uterine-and-vaginal-bleeding-unspecified-n939 | 2 | Urology | (open) | — | open | Batch 008, 2 variants |
| induced-termination-of-pregnancy-with-unsp-complications-o0480 | 2 | Obstetrics | (open) | — | open | Batch 008, 2 variants |
| obstetric-trauma-unspecified-o719 | 2 | Obstetrics | (open) | — | open | Batch 008, 2 variants |
| undescended-testicle-unspecified-q539 | 2 | Genetics | (open) | — | open | Batch 008, 2 variants |
| myelitis-unspecified-g0491 | 2 | Neurology | (open) | — | open | Batch 008, 2 variants |
| acute-viral-hepatitis-unspecified-b179 | 2 | Infectious Disease | (open) | — | open | Batch 008, 2 variants |
| acute-disseminated-demyelination-unspecified-g369 | 2 | Neurology | (open) | — | open | Batch 008, 2 variants |
| intestinal-obstruction-of-newborn-unspecified-p769 | 2 | Neonatology | (open) | — | open | Batch 008, 2 variants |
| typhoid-meningitis-a0101 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| typhoid-fever-with-heart-involvement-a0102 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| typhoid-arthritis-a0104 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| paratyphoid-fever-a-a011 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| paratyphoid-fever-b-a012 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| paratyphoid-fever-c-a013 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-enteritis-a020 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-meningitis-a0221 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-arthritis-a0223 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-with-other-localized-infection-a0229 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| enteropathogenic-escherichia-coli-infection-a040 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| enterotoxigenic-escherichia-coli-infection-a041 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| enteroinvasive-escherichia-coli-infection-a042 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| rotaviral-enteritis-a080 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| typhoid-pneumonia-a0103 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| typhoid-osteomyelitis-a0105 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-sepsis-a021 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-pneumonia-a0222 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-osteomyelitis-a0224 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| salmonella-pyelonephritis-a0225 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| campylobacter-enteritis-a045 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| enterocolitis-d-t-clostridium-difficile-not-spcf-as-recur-a0472 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-keratitis-a1852 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| foodborne-staphylococcal-intoxication-a050 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| foodborne-clostridium-perfringens-intoxication-a052 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| foodborne-vibrio-parahaemolyticus-intoxication-a053 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| foodborne-bacillus-cereus-intoxication-a054 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| foodborne-vibrio-vulnificus-intoxication-a055 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| chronic-intestinal-amebiasis-a061 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| amebic-nondysenteric-colitis-a062 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| ameboma-of-intestine-a063 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| cutaneous-amebiasis-a067 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| amebic-cystitis-a0681 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| balantidiasis-a070 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| giardiasis-lambliasis-a071 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| cryptosporidiosis-a072 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| isosporiasis-a073 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| cyclosporiasis-a074 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| pedophilia-f654 | 2 | Psychiatry | (open) | — | open | Batch 008, 1 variant |
| enterohemorrhagic-escherichia-coli-infection-a043 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| botulism-food-poisoning-a051 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| amebic-liver-abscess-a064 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| amebic-lung-abscess-a065 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| amebic-brain-abscess-a066 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| adenoviral-enteritis-a082 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| calicivirus-enteritis-a0831 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| astrovirus-enteritis-a0832 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-lung-a150 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-intrathoracic-lymph-nodes-a154 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-larynx-trachea-and-bronchus-a155 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-pleurisy-a156 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| primary-respiratory-tuberculosis-a157 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-meningitis-a170 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| meningeal-tuberculoma-a171 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-meningoencephalitis-a1782 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-neuritis-a1783 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-spine-a1801 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-arthritis-of-other-joints-a1802 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-other-bones-a1803 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-kidney-and-ureter-a1811 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-bladder-a1812 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-other-urinary-organs-a1813 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-prostate-a1814 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-other-male-genital-organs-a1815 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-cervix-a1816 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-female-pelvic-inflammatory-disease-a1817 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculoma-of-brain-and-spinal-cord-a1781 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculosis-of-other-female-genital-organs-a1818 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-peripheral-lymphadenopathy-a182 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| tuberculous-enteritis-a1832 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |
| retroperitoneal-tuberculosis-a1839 | 2 | Infectious Disease | (open) | — | open | Batch 008, 1 variant |

<!-- BATCH 009 — 100 conditions, generated 2026-05-12 -->
| actinomycotic-sepsis-a427 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gas-gangrene-a480 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-congenital-syphilitic-oculopathy-a5001 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-congenital-syphilitic-osteochondropathy-a5002 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-congenital-syphilitic-pharyngitis-a5003 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-cutaneous-congenital-syphilis-a5006 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-mucocutaneous-congenital-syphilis-a5007 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-visceral-congenital-syphilis-a5008 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-congenital-syphilis-latent-a501 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-interstitial-keratitis-a5031 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-chorioretinitis-a5032 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-meningitis-a5041 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-encephalitis-a5042 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-polyneuropathy-a5043 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-optic-nerve-atrophy-a5044 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| juvenile-general-paresis-a5045 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| clutton-s-joints-a5051 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| hutchinson-s-teeth-a5052 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| hutchinson-s-triad-a5053 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-cardiovascular-syphilis-a5054 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-arthropathy-a5055 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilitic-osteochondropathy-a5056 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-congenital-syphilitic-pneumonia-a5004 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-congenital-syphilitic-rhinitis-a5005 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-congenital-syphilis-latent-a506 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| primary-genital-syphilis-a510 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| primary-anal-syphilis-a511 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| primary-syphilis-of-other-sites-a512 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| condyloma-latum-a5131 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilitic-alopecia-a5132 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| secondary-syphilitic-meningitis-a5141 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| secondary-syphilitic-female-pelvic-disease-a5142 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| secondary-syphilitic-oculopathy-a5143 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| secondary-syphilitic-nephritis-a5144 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| secondary-syphilitic-osteopathy-a5146 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| early-syphilis-latent-a515 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilitic-aortitis-a5202 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilitic-cerebral-arteritis-a5204 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| tabes-dorsalis-a5211 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-syphilitic-meningitis-a5213 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-syphilitic-encephalitis-a5214 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-syphilitic-neuropathy-a5215 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| general-paresis-a5217 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| asymptomatic-neurosyphilis-a522 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| secondary-syphilitic-hepatitis-a5145 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilitic-aneurysm-of-aorta-a5201 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilitic-endocarditis-a5203 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-syphilitic-oculopathy-a5271 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilis-of-lung-and-bronchus-a5272 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| symptomatic-late-syphilis-of-other-respiratory-organs-a5273 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilis-of-liver-and-other-viscera-a5274 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilis-of-kidney-and-ureter-a5275 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilis-of-bone-and-joint-a5277 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| syphilis-of-other-musculoskeletal-tissue-a5278 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| late-syphilis-latent-a528 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| zoster-encephalitis-b020 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonocl-infct-of-lower-gu-tract-w-periureth-and-acc-glnd-abcs-a541 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-infection-of-kidney-and-ureter-a5421 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-prostatitis-a5422 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-infection-of-other-male-genital-organs-a5423 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-female-pelvic-inflammatory-disease-a5424 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-iridocyclitis-a5432 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-keratitis-a5433 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-spondylopathy-a5441 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-arthritis-a5442 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| white-piedra-b362 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-conjunctivitis-a5431 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-osteomyelitis-a5443 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-infection-of-other-musculoskeletal-tissue-a5449 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-pharyngitis-a545 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-infection-of-anus-and-rectum-a546 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-meningitis-a5481 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-heart-infection-a5483 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| chlamydial-cystitis-and-urethritis-a5601 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| chlamydial-vulvovaginitis-a5602 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| chlamydial-female-pelvic-inflammatory-disease-a5611 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| chlamydial-infection-of-anus-and-rectum-a563 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| chlamydial-infection-of-pharynx-a564 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| sexually-transmitted-chlamydial-infection-of-other-sites-a568 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| chancroid-a57 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| granuloma-inguinale-a58 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| trichomonal-vulvovaginitis-a5901 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| trichomonal-prostatitis-a5902 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| trichomonal-cystitis-and-urethritis-a5903 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| trichomoniasis-of-other-sites-a598 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| herpesviral-infection-of-penis-a6001 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| herpesviral-infection-of-other-male-genital-organs-a6002 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| paraphimosis-n472 | 2 | Urology | (open) | — | open | Batch 009, 1 variant |
| gonococcal-brain-abscess-a5482 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-peritonitis-a5485 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-pneumonia-a5484 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| gonococcal-sepsis-a5486 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| herpesviral-cervicitis-a6003 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| herpesviral-vulvovaginitis-a6004 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| herpesviral-infection-of-other-urogenital-tract-a6009 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| herpesviral-infection-of-perianal-skin-and-rectum-a601 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| nonvenereal-syphilis-a65 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| initial-lesions-of-yaws-a660 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| multiple-papillomata-and-wet-crab-yaws-a661 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |
| hyperkeratosis-of-yaws-a663 | 2 | Infectious Disease | (open) | — | open | Batch 009, 1 variant |

<!-- BATCH 010 — 100 conditions, generated 2026-05-12 -->
| tuberculosis-of-skin-and-subcutaneous-tissue-a184 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| bagassosis-j671 | 2 | Pulmonology | (open) | — | open | Batch 010, 1 variant |
| malig-neoplasm-of-aryepiglottic-fold-hypopharyngeal-aspect-c131 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| sleep-related-bruxism-g4763 | 2 | Neurology | (open) | — | open | Batch 010, 1 variant |
| systemic-sclerosis-with-lung-involvement-m3481 | 2 | Orthopedics | (open) | — | open | Batch 010, 1 variant |
| polytrichia-l683 | 2 | Dermatology | (open) | — | open | Batch 010, 1 variant |
| intramural-leiomyoma-of-uterus-d251 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| iron-deficiency-e611 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| typical-atrial-flutter-i483 | 2 | Cardiology | (open) | — | open | Batch 010, 1 variant |
| vascular-dementia-without-behavioral-disturbance-f0150 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| severe-sepsis-without-septic-shock-r6520 | 2 | General Medicine | (open) | — | open | Batch 010, 1 variant |
| tuberculous-episcleritis-a1851 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| suberosis-j673 | 2 | Pulmonology | (open) | — | open | Batch 010, 1 variant |
| malig-neoplm-of-ovrlp-sites-of-lip-oral-cavity-and-pharynx-c148 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| huntington-s-disease-g10 | 2 | Neurology | (open) | — | open | Batch 010, 1 variant |
| systemic-sclerosis-with-myopathy-m3482 | 2 | Orthopedics | (open) | — | open | Batch 010, 1 variant |
| atopic-neurodermatitis-l2081 | 2 | Dermatology | (open) | — | open | Batch 010, 1 variant |
| subserosal-leiomyoma-of-uterus-d252 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| magnesium-deficiency-e612 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| vascular-dementia-with-behavioral-disturbance-f0151 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| severe-sepsis-with-septic-shock-r6521 | 2 | General Medicine | (open) | — | open | Batch 010, 1 variant |
| tuberculous-chorioretinitis-a1853 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| chlamydial-pneumonia-j160 | 2 | Pulmonology | (open) | — | open | Batch 010, 1 variant |
| meckel-s-diverticulum-malignant-c173 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| pick-s-disease-g3101 | 2 | Neurology | (open) | — | open | Batch 010, 1 variant |
| systemic-sclerosis-with-polyneuropathy-m3483 | 2 | Orthopedics | (open) | — | open | Batch 010, 1 variant |
| flexural-eczema-l2082 | 2 | Dermatology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-penis-d074 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| manganese-deficiency-e613 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| dementia-in-oth-diseases-classd-elswhr-w-behavioral-disturb-f0281 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculous-iridocyclitis-a1854 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malig-neoplasm-of-ovrlp-sites-of-rectum-anus-and-anal-canal-c218 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| sicca-syndrome-with-lung-involvement-m3502 | 2 | Orthopedics | (open) | — | open | Batch 010, 1 variant |
| granuloma-annulare-l920 | 2 | Dermatology | (open) | — | open | Batch 010, 1 variant |
| ben-neoplm-of-connctv-soft-tiss-of-r-upper-limb-inc-shldr-d2111 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| chromium-deficiency-e614 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| mood-disord-d-t-physiol-cond-w-major-depressive-like-epsd-f0632 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculosis-of-adrenal-glands-a187 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| liver-cell-carcinoma-c220 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| sicca-syndrome-with-myopathy-m3503 | 2 | Orthopedics | (open) | — | open | Batch 010, 1 variant |
| benign-carcinoid-tumor-of-the-stomach-d3a092 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| molybdenum-deficiency-e615 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| postconcussional-syndrome-f0781 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculosis-of-thyroid-gland-a1881 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| intrahepatic-bile-duct-carcinoma-c221 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| neoplasm-of-uncertain-behavior-of-mediastinum-d383 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| vanadium-deficiency-e616 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-uncomplicated-f1010 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculosis-of-other-endocrine-glands-a1882 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| hepatoblastoma-c222 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-prostate-d075 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| nutritional-marasmus-e41 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-in-remission-f1011 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculosis-of-heart-a1884 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| angiosarcoma-of-liver-c223 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-labial-mucosa-and-vermilion-border-d0001 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| congenital-iodine-deficiency-syndrome-neurological-type-e000 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-intoxication-uncomplicated-f10120 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculosis-of-spleen-a1885 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malig-neoplasm-of-liver-not-specified-as-primary-or-sec-c229 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-buccal-mucosa-d0002 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| congenital-iodine-deficiency-syndrome-myxedematous-type-e001 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-intoxication-delirium-f10121 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| tuberculosis-of-other-sites-a1889 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malig-neoplm-of-ovrlp-sites-of-heart-mediastinum-and-pleura-c388 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-gingiva-and-edentulous-alveolar-ridge-d0003 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| congenital-iodine-deficiency-syndrome-mixed-type-e002 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-alcohol-induced-mood-disorder-f1014 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| acute-miliary-tuberculosis-of-a-single-specified-site-a190 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malig-neoplm-of-ovrlp-sites-of-bone-artic-cartl-of-r-limb-c4081 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-soft-palate-d0004 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| subclinical-iodine-deficiency-hypothyroidism-e02 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-w-alcoh-induce-psychotic-disorder-w-delusions-f10150 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| acute-miliary-tuberculosis-of-multiple-sites-a191 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malignant-melanoma-of-lip-c430 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-hard-palate-d0005 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| congenital-hypothyroidism-with-diffuse-goiter-e030 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-w-alcoh-induce-psychotic-disorder-w-hallucin-f10151 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| bubonic-plague-a200 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malignant-melanoma-of-anal-skin-c4351 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-floor-of-mouth-d0006 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| congenital-hypothyroidism-without-goiter-e031 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-alcohol-induced-anxiety-disorder-f10180 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| cellulocutaneous-plague-a201 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malignant-melanoma-of-skin-of-breast-c4352 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-tongue-d0007 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| postinfectious-hypothyroidism-e033 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-alcohol-induced-sexual-dysfunction-f10181 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| pneumonic-plague-a202 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| malignant-melanoma-of-overlapping-sites-of-skin-c438 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-pharynx-d0008 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| myxedema-coma-e035 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-alcohol-induced-sleep-disorder-f10182 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| plague-meningitis-a203 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| merkel-cell-carcinoma-of-lip-c4a0 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |
| carcinoma-in-situ-of-esophagus-d001 | 2 | Hematology | (open) | — | open | Batch 010, 1 variant |
| nontoxic-diffuse-goiter-e040 | 2 | Endocrinology | (open) | — | open | Batch 010, 1 variant |
| alcohol-abuse-with-other-alcohol-induced-disorder-f10188 | 2 | Psychiatry | (open) | — | open | Batch 010, 1 variant |
| septicemic-plague-a207 | 2 | Infectious Disease | (open) | — | open | Batch 010, 1 variant |
| merkel-cell-carcinoma-of-anal-skin-c4a51 | 2 | Oncology | (open) | — | open | Batch 010, 1 variant |



<!-- BATCH 011 (parent-injection) — 13 parent concepts, 132 subtypes rescued -->
| syphilis | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 47 subtypes |
| gonorrhea | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 19 subtypes |
| congenital-syphilis | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 13 subtypes |
| salmonella-infection | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 8 subtypes |
| typhoid-fever | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 8 subtypes |
| chlamydia-infection | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 7 subtypes |
| herpes-simplex-infection | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 6 subtypes |
| amebiasis | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 5 subtypes |
| foodborne-illness | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 5 subtypes |
| trichomoniasis | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 4 subtypes |
| e-coli-infection | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 4 subtypes |
| paratyphoid-fever | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 3 subtypes |
| yaws | 1 | Infectious Disease | (open) | — | open | Batch 011 (parent-injection), rescues 3 subtypes |



<!-- BATCH 012 — 100 conditions, generated 2026-05-12 -->
| ulceroglandular-tularemia-a210 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| merkel-cell-carcinoma-of-skin-of-breast-c4a52 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-stomach-d002 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| nontoxic-single-thyroid-nodule-e041 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-uncomplicated-f1020 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| oculoglandular-tularemia-a211 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| merkel-cell-carcinoma-of-overlapping-sites-c4a8 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-colon-d010 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| nontoxic-multinodular-goiter-e042 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-in-remission-f1021 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| pulmonary-tularemia-a212 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| basal-cell-carcinoma-of-skin-of-lip-c4401 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-rectosigmoid-junction-d011 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| thyrotoxicosis-w-diffuse-goiter-w-thyrotoxic-crisis-or-storm-e0501 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-intoxication-uncomplicated-f10220 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| gastrointestinal-tularemia-a213 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| squamous-cell-carcinoma-of-skin-of-lip-c4402 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-rectum-d012 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| thyrotxcosis-w-toxic-single-thyroid-nodule-w-thyrotxc-crisis-e0511 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-intoxication-delirium-f10221 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| generalized-tularemia-a217 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| basal-cell-carcinoma-skin-r-ear-and-external-auric-canal-c44212 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-other-parts-of-intestine-d0149 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| thyrotxcosis-w-toxic-multinodular-goiter-w-thyrotoxic-crisis-e0521 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-withdrawal-uncomplicated-f10230 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| tuberculous-peritonitis-a1831 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| squamous-cell-carcinoma-skin-r-ear-and-external-auric-canal-c44222 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-anus-and-anal-canal-d013 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| thyrotxcosis-from-ectopic-thyroid-tissue-w-thyrotoxic-crisis-e0531 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-withdrawal-delirium-f10231 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| cutaneous-anthrax-a220 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| basal-cell-carcinoma-of-anal-skin-c44510 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-liver-gallbladder-and-bile-ducts-d015 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| thyrotoxicosis-factitia-without-thyrotoxic-crisis-or-storm-e0540 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-w-withdrawal-with-perceptual-disturbance-f10232 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| pulmonary-anthrax-a221 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| basal-cell-carcinoma-of-skin-of-breast-c44511 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-larynx-d020 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| thyrotoxicosis-factitia-with-thyrotoxic-crisis-or-storm-e0541 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-alcohol-induced-mood-disorder-f1024 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| gastrointestinal-anthrax-a222 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| squamous-cell-carcinoma-of-anal-skin-c44520 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-trachea-d021 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| acute-thyroiditis-e060 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-depend-w-alcoh-induce-psychotic-disorder-w-delusions-f10250 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| glanders-a240 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| squamous-cell-carcinoma-of-skin-of-breast-c44521 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-other-parts-of-respiratory-system-d023 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| subacute-thyroiditis-e061 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-depend-w-alcoh-induce-psychotic-disorder-w-hallucin-f10251 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| acute-and-fulminating-melioidosis-a241 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| basal-cell-carcinoma-of-overlapping-sites-of-skin-c4481 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| melanoma-in-situ-of-lip-d030 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| chronic-thyroiditis-with-transient-thyrotoxicosis-e062 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-depend-w-alcoh-induce-persisting-amnestic-disorder-f1026 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| subacute-and-chronic-melioidosis-a242 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| squamous-cell-carcinoma-of-overlapping-sites-of-skin-c4482 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| melanoma-in-situ-of-anal-skin-d0351 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| autoimmune-thyroiditis-e063 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-alcohol-induced-persisting-dementia-f1027 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| spirillosis-a250 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| mesothelioma-of-pleura-c450 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| melanoma-in-situ-of-other-sites-d038 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| drug-induced-thyroiditis-e064 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-alcohol-induced-anxiety-disorder-f10280 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| streptobacillosis-a251 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| mesothelioma-of-peritoneum-c451 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-skin-of-lip-d040 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| hypersecretion-of-calcitonin-e070 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-alcohol-induced-sexual-dysfunction-f10281 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| cutaneous-erysipeloid-a260 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| mesothelioma-of-pericardium-c452 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| melanocytic-nevi-of-lip-d220 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| dyshormogenetic-goiter-e071 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-alcohol-induced-sleep-disorder-f10282 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| aseptic-meningitis-in-leptospirosis-a2781 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| mesothelioma-of-other-sites-c457 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-skin-of-other-sites-d048 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| sick-euthyroid-syndrome-e0781 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| alcohol-dependence-with-other-alcohol-induced-disorder-f10288 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| pasteurellosis-a280 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| kaposi-s-sarcoma-of-skin-c460 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-scrotum-d0761 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| drug-chem-diabetes-mellitus-w-hyperosmolarity-w-coma-e0901 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| opioid-abuse-uncomplicated-f1110 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| cat-scratch-disease-a281 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| kaposi-s-sarcoma-of-soft-tissue-c461 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-other-male-genital-organs-d0769 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| drug-chem-diabetes-mellitus-w-ketoacidosis-w-coma-e0911 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| opioid-abuse-in-remission-f1111 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| extraintestinal-yersiniosis-a282 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| kaposi-s-sarcoma-of-palate-c462 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-bladder-d090 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| drug-chem-diabetes-mellitus-w-diabetic-nephropathy-e0921 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| opioid-abuse-with-intoxication-uncomplicated-f11120 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |
| indeterminate-leprosy-a300 | 2 | Infectious Disease | (open) | — | open | Batch 012, 1 variant |
| kaposi-s-sarcoma-of-lymph-nodes-c463 | 2 | Oncology | (open) | — | open | Batch 012, 1 variant |
| carcinoma-in-situ-of-other-urinary-organs-d0919 | 2 | Hematology | (open) | — | open | Batch 012, 1 variant |
| marasmic-kwashiorkor-e42 | 2 | Endocrinology | (open) | — | open | Batch 012, 1 variant |
| opioid-abuse-with-intoxication-delirium-f11121 | 2 | Psychiatry | (open) | — | open | Batch 012, 1 variant |

<!-- BATCH 013 — 15 conditions, generated 2026-05-12 -->
| alcohol-use-disorder | 1 | Psychiatry | (open) | — | open | Batch 013, 24 variants |
| opioid-use-disorder | 1 | Psychiatry | (open) | — | open | Batch 013, 21 variants |
| goiter | 1 | Endocrinology | (open) | — | open | Batch 013, 8 variants |
| leprosy | 1 | Infectious Disease | (open) | — | open | Batch 013, 7 variants |
| kaposi-sarcoma | 1 | Oncology | (open) | — | open | Batch 013, 6 variants |
| tularemia | 1 | Infectious Disease | (open) | — | open | Batch 013, 5 variants |
| plague | 1 | Infectious Disease | (open) | — | open | Batch 013, 5 variants |
| thyroiditis | 1 | Endocrinology | (open) | — | open | Batch 013, 5 variants |
| basal-cell-carcinoma | 1 | Oncology | (open) | — | open | Batch 013, 5 variants |
| squamous-cell-carcinoma | 1 | Oncology | (open) | — | open | Batch 013, 5 variants |
| anthrax | 1 | Infectious Disease | (open) | — | open | Batch 013, 4 variants |
| thyrotoxicosis | 1 | Endocrinology | (open) | — | open | Batch 013, 4 variants |
| merkel-cell-carcinoma | 1 | Oncology | (open) | — | open | Batch 013, 4 variants |
| melioidosis | 1 | Infectious Disease | (open) | — | open | Batch 013, 2 variants |
| atypical-mycobacterial-infection | 1 | Infectious Disease | (open) | — | open | Batch 013, 2 variants |

<!-- BATCH 014 — 100 conditions, generated 2026-05-12 -->
| hurler-s-syndrome-e7601 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| genetic-anomalies-of-leukocytes-d720 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| type-2-diabetes-mellitus-with-hyperosmolarity-with-coma-e1101 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| severe-combined-immunodeficiency-with-reticular-dysgenesis-d810 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| neoplasm-of-uncertain-behavior-of-prostate-d400 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| primary-adrenocortical-insufficiency-e271 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| nondiabetic-hypoglycemic-coma-e15 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| sideropenic-dysphagia-d501 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| com-variab-immunodef-w-predom-abnlt-of-b-cell-nums-functn-d830 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| drug-induced-autoimmune-hemolytic-anemia-d590 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| drug-induced-aplastic-anemia-d611 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| acromegaly-and-pituitary-gigantism-e220 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| hereditary-spherocytosis-d580 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| hyposplenism-d730 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| chronic-acquired-pure-red-cell-aplasia-d600 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| primary-hyperparathyroidism-e210 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| functional-disorders-of-polymorphonuclear-neutrophils-d71 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| intraop-hemor-hemtom-of-the-spleen-comp-a-proc-on-the-spleen-d7801 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| brief-psychotic-disorder-f23 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| classical-phenylketonuria-e700 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| kwashiorkor-e40 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| maple-syrup-urine-disease-e710 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| myeloid-sarcoma-in-remission-c9231 | 2 | Oncology | (open) | — | open | Batch 014, 1 variant |
| riboflavin-deficiency-e530 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| acute-chagas-disease-with-heart-involvement-b570 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| carcinoid-syndrome-e340 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| drug-induced-obesity-e661 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| ben-neoplm-of-prph-nrv-autonm-nrv-sys-upr-lmb-inc-shldr-d3612 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| hereditary-erythropoietic-porphyria-e800 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| dengue-fever-classical-dengue-a90 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| wilson-s-disease-e8301 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| cystinuria-e7201 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| deficiency-of-vitamin-e-e560 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| dietary-selenium-deficiency-e59 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| allergic-purpura-d690 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| monkeypox-b04 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| pulmonary-mucormycosis-b460 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| drug-induced-hypoglycemia-without-coma-e160 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| sandhoff-disease-e7501 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| shared-psychotic-disorder-f24 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| ascorbic-acid-deficiency-e54 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| toxoplasma-chorioretinitis-b5801 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| benign-carcinoid-tumor-of-the-duodenum-d3a010 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| bipolar-disorder-current-episode-hypomanic-f310 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| pneumocystosis-b59 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| opioid-abuse-with-intoxication-with-perceptual-disturbance-f11122 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| trichinellosis-b75 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| enteroviral-exanthematous-fever-boston-exanthem-a880 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| disseminated-intravascular-coagulation-d65 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| anemia-in-neoplastic-disease-d630 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| hepatitis-a-with-hepatic-coma-b150 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| nicotine-dependence-cigarettes-uncomplicated-f17210 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| sylvatic-yellow-fever-a950 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| oropouche-virus-disease-a930 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| acute-pulmonary-histoplasmosis-capsulati-b390 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| acute-pulmonary-blastomycosis-b400 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| dietary-calcium-deficiency-e58 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| trichuriasis-b79 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| japanese-encephalitis-a830 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| intraop-hemor-hemtom-of-endo-sys-org-comp-an-endo-sys-proc-e3601 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| plasmodium-vivax-malaria-with-rupture-of-spleen-b510 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| smallpox-b03 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| congenital-methemoglobinemia-d740 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| familial-erythrocytosis-d750 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| primary-lesions-of-pinta-a670 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| onchocerciasis-with-endophthalmitis-b7301 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| alpha-thalassemia-d560 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| babesiosis-b600 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| conn-s-syndrome-e2601 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| dietary-folate-deficiency-anemia-d520 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| panic-disorder-episodic-paroxysmal-anxiety-f410 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| hymenolepiasis-b710 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| echinococcus-granulosus-infection-of-liver-b670 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| scarlet-fever-with-otitis-media-a380 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| chikungunya-virus-disease-a920 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| gummata-and-ulcers-of-yaws-a664 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| lobomycosis-b480 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| measles-complicated-by-encephalitis-b050 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| visceral-larva-migrans-b830 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| hypercarotinemia-e671 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| intestinal-strongyloidiasis-b780 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| hemophagocytic-lymphohistiocytosis-d761 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| sarcoidosis-of-lung-d860 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| acute-paralytic-poliomyelitis-vaccine-associated-a800 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| essential-fatty-acid-efa-deficiency-e630 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| neoplasm-of-uncertain-behavior-of-thyroid-gland-d440 | 2 | Hematology | (open) | — | open | Batch 014, 1 variant |
| cyclothymic-disorder-f340 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| ascariasis-pneumonia-b7781 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| small-cell-b-cell-lymphoma-nodes-of-axilla-and-upper-limb-c8304 | 2 | Oncology | (open) | — | open | Batch 014, 1 variant |
| agoraphobia-with-panic-disorder-f4001 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| pulmonary-actinomycosis-a420 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| malig-neoplm-of-ovrlp-sites-of-prph-nrv-and-autonm-nrv-sys-c478 | 2 | Oncology | (open) | — | open | Batch 014, 1 variant |
| acute-hepatitis-c-with-hepatic-coma-b1711 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| secondary-malignant-neoplasm-of-r-kidney-and-renal-pelvis-c7901 | 2 | Oncology | (open) | — | open | Batch 014, 1 variant |
| opisthorchiasis-b660 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| dissociative-amnesia-f440 | 2 | Psychiatry | (open) | — | open | Batch 014, 1 variant |
| multiple-myeloma-not-having-achieved-remission-c9000 | 2 | Oncology | (open) | — | open | Batch 014, 1 variant |
| moderate-protein-calorie-malnutrition-e440 | 2 | Endocrinology | (open) | — | open | Batch 014, 1 variant |
| eumycetoma-b470 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |
| loiasis-b743 | 2 | Infectious Disease | (open) | — | open | Batch 014, 1 variant |



<!-- BATCH 015 (parent-injection) — 8 parent concepts, 50 subtypes rescued -->
| carcinoma-in-situ | 1 | Oncology | (open) | — | open | Batch 015 (parent-injection), rescues 27 subtypes |
| hepatitis-general | 1 | Infectious Disease | (open) | — | open | Batch 015 (parent-injection), rescues 6 subtypes |
| mesothelioma-general | 1 | Oncology | (open) | — | open | Batch 015 (parent-injection), rescues 5 subtypes |
| type-2-diabetes-mellitus | 1 | Endocrinology | (open) | — | open | Batch 015 (parent-injection), rescues 3 subtypes |
| melanoma-in-situ | 1 | Oncology | (open) | — | open | Batch 015 (parent-injection), rescues 3 subtypes |
| pituitary-disorders | 1 | Endocrinology | (open) | — | open | Batch 015 (parent-injection), rescues 2 subtypes |
| mood-disorder | 1 | Psychiatry | (open) | — | open | Batch 015 (parent-injection), rescues 2 subtypes |
| panic-disorder | 1 | Psychiatry | (open) | — | open | Batch 015 (parent-injection), rescues 2 subtypes |



<!-- BATCH 016 — 100 conditions, generated 2026-05-12 -->
| tyrosinemia-e7021 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| anisakiasis-b810 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| eczema-herpeticum-b000 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| viral-pharyngoconjunctivitis-b302 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| plasmodium-ovale-malaria-b530 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| cutaneous-strongyloidiasis-b781 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| systemic-bartonellosis-a440 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| mediastnl-large-b-cell-lymph-nodes-of-axilla-and-upper-limb-c8524 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| hepatitis-a-without-hepatic-coma-b159 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| rubella-encephalitis-b0601 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| q-fever-a78 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| cysticercosis-of-central-nervous-system-b690 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| intermediate-lesions-of-pinta-a671 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| chronic-pulmonary-blastomycosis-b401 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| refractory-anemia-without-ring-sideroblasts-so-stated-d460 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| hereditary-hypogammaglobulinemia-d800 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| benign-lipomatous-neoplasm-of-intrathoracic-organs-d174 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| neoplasm-of-uncertain-behavior-of-oth-male-genital-organs-d408 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| submucous-leiomyoma-of-uterus-d250 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| cercarial-dermatitis-b653 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| sandfly-fever-a931 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| invasive-pulmonary-aspergillosis-b440 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| intraop-hemor-hemtom-of-an-endo-sys-org-comp-oth-procedure-e3602 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| long-chain-very-long-chain-acyl-coa-dehydrogenase-deficiency-e71310 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| acute-posthemorrhagic-anemia-d62 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| cutaneous-listeriosis-a320 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| ben-neoplm-of-prph-nrv-autonm-nrv-sys-of-low-lmb-inc-hip-d3613 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| hurler-scheie-syndrome-e7602 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| tuberculoid-leprosy-a301 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| legionnaires-disease-a481 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| disorders-of-endocrine-glands-in-diseases-classd-elswhr-e35 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| nodular-lymphocy-predom-hodgkin-lymphoma-intrathorac-nodes-c8102 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| acute-stress-reaction-f430 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| kaposi-s-sarcoma-of-gastrointestinal-sites-c464 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| varicella-meningitis-b010 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| hemophagocytic-syndrome-infection-associated-d762 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| clonorchiasis-b661 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| hereditary-sideroblastic-anemia-d640 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| constitutional-tall-stature-e344 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| enterobiasis-b80 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| postproc-hemor-of-an-endo-sys-org-fol-an-endo-sys-procedure-e89810 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| congenital-adrenogenital-disorders-assoc-w-enzyme-deficiency-e250 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| anemia-in-chronic-kidney-disease-d631 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| secondary-malignant-neoplasm-of-mediastinum-c781 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| mixed-obsessional-thoughts-and-acts-f422 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| opioid-abuse-with-opioid-induced-mood-disorder-f1114 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| neoplasm-of-uncertain-behavior-of-brain-infratentorial-d431 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| bipolar-disorder-current-episode-depressed-mild-f3131 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| disorders-of-zinc-metabolism-e832 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| inhalant-abuse-uncomplicated-f1810 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| familial-hypercholesterolemia-e7801 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| congenital-lactase-deficiency-e730 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| far-eastern-tick-borne-encephalitis-a840 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| small-cell-b-cell-lymph-nodes-of-ing-region-and-lower-limb-c8305 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| epidemic-vertigo-a881 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| mild-protein-calorie-malnutrition-e441 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| congenital-agranulocytosis-d700 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| persistent-hyperplasia-of-thymus-e320 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| pulmonary-cryptococcosis-b450 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| cocaine-abuse-in-remission-f1411 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| tetanus-neonatorum-a33 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| dengue-hemorrhagic-fever-a91 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| dietary-zinc-deficiency-e60 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| gangosa-a665 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| human-immunodeficiency-virus-hiv-disease-b20 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| neoplasm-of-uncertain-behavior-of-parathyroid-gland-d442 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| abdominal-actinomycosis-a421 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| follicular-lymphoma-grade-i-intrathoracic-lymph-nodes-c8202 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| epidemic-louse-borne-typhus-fever-d-t-rickettsia-prowazekii-a750 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| carcinoma-in-situ-of-thyroid-and-other-endocrine-glands-d093 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| sarcoidosis-of-lymph-nodes-d861 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| leptospirosis-icterohemorrhagica-a270 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| type-1-diabetes-mellitus-with-ketoacidosis-without-coma-e1010 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| scabies-b86 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| sedative-hypnotic-or-anxiolytic-abuse-uncomplicated-f1310 | 2 | Psychiatry | (open) | — | open | Batch 016, 1 variant |
| testicular-hyperfunction-e290 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| variant-creutzfeldt-jakob-disease-a8101 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| chronic-viral-hepatitis-b-with-delta-agent-b180 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| acute-paralytic-poliomyelitis-wild-virus-imported-a801 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| louse-borne-relapsing-fever-a680 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| acute-erythroid-leukemia-not-having-achieved-remission-c9400 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| obstetrical-tetanus-a34 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| gammaherpesviral-mononucleosis-with-polyneuropathy-b2701 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| wiskott-aldrich-syndrome-d820 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| malig-neoplasm-of-ovrlp-sites-of-retroperiton-and-peritoneum-c488 | 2 | Oncology | (open) | — | open | Batch 016, 1 variant |
| gnathostomiasis-b831 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| allescheriasis-b482 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| neoplasm-of-uncertain-behavior-of-oth-urinary-organs-d418 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| cutaneous-chromomycosis-b430 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| hemorrhagic-fever-with-renal-syndrome-a985 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| ehrlichiosis-chafeensis-e-chafeensis-a7741 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| scarlet-fever-with-myocarditis-a381 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| lassa-fever-a962 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| protein-deficiency-anemia-d530 | 2 | Hematology | (open) | — | open | Batch 016, 1 variant |
| tay-sachs-disease-e7502 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| erysipelas-a46 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| cutaneous-myiasis-b870 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| onchocerciasis-with-glaucoma-b7302 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |
| lesch-nyhan-syndrome-e791 | 2 | Endocrinology | (open) | — | open | Batch 016, 1 variant |
| human-herpesvirus-6-encephalitis-b1001 | 2 | Infectious Disease | (open) | — | open | Batch 016, 1 variant |

## Rules

1. **Claim before drafting.** Add your row with `assignee` and `status: claimed` before opening the JSON file.
2. **Update status as you progress.** `drafting` → `validating` → `pr-open` → `done`.
3. **If you abandon a claim**, change status back to `open` and remove your name. Don't leave silent stale claims.
4. **One PR per condition.** Atomic commits.
5. **Cross-link work**: if you find that a confusedWith/related slug doesn't exist or is wrong, raise it here in Notes — don't silently change the schema or the canonical slug.

---

## Reviewer assignments (separate ledger)

When real MD reviewers are recruited, track per-specialty assignment here:

| Specialty | Reviewer (name, license #) | Pages covered | Last reviewed |
|---|---|---|---|
| Placeholder (all specialties) | AIHealz Medical Editorial Board (doctor id 1001) | All Tier-1 content currently | 2026-05-12 |
