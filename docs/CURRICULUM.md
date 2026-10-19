# Curriculum alignment — preliminary mapping

Last checked 19 October 2026. This is a development mapping; individual mission-level statements need educator review before claiming examination-board equivalence.

## Sources

- DfE statutory [Science programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study)
- DfE [Design and Technology programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-design-and-technology-programmes-of-study)
- [AQA Physics 8463](https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification)
- [OCR Gateway Physics A J249](https://www.ocr.org.uk/qualifications/gcse/gateway-science-suite-physics-a-j249-from-2016/specification-at-a-glance/)
- [OCR Combined Science A J250](https://www.ocr.org.uk/qualifications/gcse/gateway-science-suite-combined-science-a-j250-from-2016/specification-at-a-glance/)
- [OCR Twenty First Century Science B J260](https://www.ocr.org.uk/qualifications/gcse/twenty-first-century-science-suite-combined-science-b-j260-from-2016/specification-at-a-glance/)
- Pearson Edexcel GCSE Physics 1PH0: independent statement-by-statement mapping outstanding.

## Bands

| Game band | Statutory or specification relationship | Interpretation |
| --- | --- | --- |
| Year 4 | Science, electricity | Appliances, simple series circuits, complete loops, conductors, switches and safety |
| Year 5 | Consolidation + D&T enrichment | Not a separately statutory electricity unit for Year 5 |
| Year 6 | Science, electricity | Recognised symbols, cell number/voltage effects, component behaviour in simple series circuits |
| Years 7–9 | Science KS3 + D&T | KS3 is a *key-stage* allocation, not fixed Year 7/8/9 national prescriptions |
| Year 10 | GCSE electricity | Engineering and calculations, practical investigation; precise tiering varies |
| Year 11 | GCSE energy/electromagnetism and mains safety | Separate Physics / Higher Tier / Combined Science must be specified per exam board |

In `src/missions.ts`, each of the 80 records has a level code, title, year, short concept, explanation, challenge, starter model, broad source and an initial classification (`core`, `enrichment`, `separate`, `higher`). **This classification is provisional and not reliable for high-stakes tier selection.** AQA, Edexcel and OCR specifications require separate, exact topic tagging. Some current Year 11 activities are supporting DC analogues and do not simulate AC or electromagnetic induction.

## Scientific model limitations

The DC solver correctly follows an electrical network of connected conductors and resistors rather than geometry. Bulbs, buzzers, motors and electromagnetic coils are fixed resistive approximations. They are not physical brightness, decibel, torque or magnetic-field simulators. Diodes are piecewise thresholds. AC and transformer lessons have narrative content but no AC physics engine.

A primary learner should not interpret an animated charge flow as electricity being consumed. The *charge* circulates; the cell transfers energy. The voltmeter approximation has a very high input resistance and the ammeter a very low resistance.

## Teacher review checklist

Before release as a GCSE revision tool, document each specification reference and tier, inspect every explanation and worked answer, audit the use of equations sheets and required-practical methods, and assess knowledge independently of help/hints. Confirm accessibility with young learners and teachers.
