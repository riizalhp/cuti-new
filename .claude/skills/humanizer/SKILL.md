---
name: humanizer
description: Make text sound like a human wrote it. Audits text for 55 AI writing patterns and rewrites in five voice profiles (casual, professional, technical, warm, blunt) with natural burstiness, sentence variation, and authentic tone.
---

# Humanizer Skill

Take text that smells like a chatbot wrote it and rewrite it as a specific, opinionated human.

## Modes

- `detect`: Report matched AI patterns, burstiness analysis, and AI density score (0-100) without modifying the text.
- `rewrite`: (Default) Full transformation removing AI tells, varying rhythm, applying target persona.
- `edit`: In-place targeted edits on text or markdown files.

## Voice Profiles

- `casual`: Contractions, first-person commentary, sentence fragments, conversational cadence.
- `professional`: Clean formatting, concrete proof, dry wit, active voice.
- `technical`: Exact nomenclature, concrete numbers, zero fluff, direct clarity.
- `warm`: Inclusive pronouns, short punchy paragraphs, encouraging and accessible.
- `blunt`: Compressed sentences, strong assertions, no pleasantries, zero filler.

## Core Rules

1. **Ban em dashes (`—`)** and mechanical bullet formulas.
2. **Increase burstiness**: Mix short 2-3 word sentences with long, winding thoughts naturally.
3. **Strip empty wrappers**: Eliminate throat-clearing openings ("In today's fast-paced world...", "It is important to remember...") and generic summary conclusions.
4. **Concrete > Abstract**: Swap marketing buzzwords ("revolutionize", "seamless", "delve", "game-changer", "testament") for real facts, metrics, and specific outcomes.
5. **Preserve factual accuracy**: Never alter numbers, code snippets, quotations, or product names.
