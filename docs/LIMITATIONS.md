# Known limitations and next implementation work

This commit is an **early playable foundation**, not an acceptance-complete Year 4–11 engineering curriculum.

1. Eighty individual *content records* exist; instruction phases and experiments are currently shared scaffolding rather than 80 bespoke independently playtested engineering missions. The final engineering missions need richer design constraints and world events.
2. Forty side activities are currently clickable exploration finds; they do not include the planned navigation, bridge repair or maintenance-robot mini-games.
3. Seven starter circuit designs exist; the brief asks for twenty guided experiment templates.
4. The editor supports selecting, tapping terminals, adding, removing, keyboard movement and zoom buttons. Free dragging, pan gestures, rotate tools and printable polished circuit schematics are not yet finished.
5. Picture and diagram modes are illustrative: the diagram mode glyphs need professional IEC/BS validation and symbol library review.
6. The DC nodal electrical solver does not model batteries' discharge, lamp filament heating, motors' back EMF, AC, transformers, inductive transients, magnetic flux, capacitors, logic gates, transistor switching, relay dynamics or firmware. These are explicitly unavailable or labelled approximations.
7. The practice phase begins with two general introductory checks, not bespoke two-experiment sequences per concept. Numerical GCSE practice supports only a small number of formula families.
8. The current completion flags record 'assisted' and 'independent' for an activity, not validated independent mastery after spaced assessment.
9. Hero customisation is limited to suit colour. Optional browser speech chooses available en-GB voices; the shared Cloudflare voice endpoint is not configured.
10. Offline service worker, Safari and Chrome on real phones, touch accessibility, screen-reader flow and browser storage quota have not been independently device-tested.
11. No ChoreQuest auth/points sync is implemented because the public contract must be confirmed; there is no unverified client endpoint.
12. England GCSE Combined/Separate and Foundation/Higher exam-board-specific topic matrices, required practical simulations, graph interpretation, assessment quality assurance and teacher-designed sequences require further implementation and education review.
13. Saved progress and inventions are local to the browser unless manually exported.
14. Custom domain SSL and GitHub Pages status must be verified after GitHub has processed Pages Actions and domain settings.
