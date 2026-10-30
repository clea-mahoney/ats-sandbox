# ATS sandbox

A three-minute fictional screening-policy exercise by Clea Mahoney.

[Open the exercise](https://clea-mahoney.github.io/ats-sandbox/)

## Learning goal

Given a job brief and candidate evidence, choose relevant screening criteria, identify the evidence a rule excludes, and ask a follow-up question when evidence is missing.

## The experience

1. Choose six rules before seeing feedback.
2. Inspect three fictional profiles and see how the selected rules affect each one.
3. Revise the policy against the job brief.
4. Apply the same criteria to a new profile with missing evidence.
5. Copy the resulting practice policy and review the session’s attempts.

The first three profiles distinguish relevant experience from matching tools and titles. The final profile checks whether the learner asks for missing evidence instead of assuming a tool match establishes capability. Fictional numbers are scenario evidence, not portfolio results.

## Evaluation and limits

`lesson.mjs` holds the authored criteria, fictional evidence, and deterministic evaluation functions. Explicit rule choices are checked against the scenario answer key. Free-text notes are not graded. Missing evidence is distinct from failing a selected requirement. The exercise does not make hiring decisions, call an AI model, calculate candidate-match scores, or claim to reproduce any particular ATS product.

Feedback is authored, not generated. Attempts describe a single practice session, not learning effectiveness or hiring accuracy. Input is kept only in memory for the current tab; no analytics, storage, or backend is included. Google Fonts is the only external display dependency. The exercise remains usable with a fallback font if it is unavailable.

The previous prototype used keyword matching under labels suggesting an executed LLM judge, and displayed a hardcoded match percentage. Those claims and the free-text grader have been removed. The candidate-detail view borrows the useful evidence-inspection idea from a separate Gemini dashboard sketch.

## Run and check

Serve this folder with any static HTTP server, for example `python3 -m http.server 8765`, then open the printed local address. No install or build is required.

Run `node --test lesson.test.mjs` to check the authored policy matrix, missing-evidence handling, validation, and transfer feedback.

The interface uses Clea’s DM Sans type and approved Seafoam/Lagoon, Apricot/Rosewood, and neutral palette. Semantic forms, native radio groups, visible focus indicators, live feedback, and focus changes support keyboard and screen-reader navigation.
