# Blog Writing Standards — Avoiding AI Slop

Source: *AI Slop Recognition Training*. Adapted for soldiertomillionaire.com blog posts.

Apply this before publishing any post, whether drafted by Joe, by Claude, or by both.
The four categories below are failure modes. Each has a **flag when** test, a rewrite
example, and a **do not flag when** exception so the rule does not get over-applied.

The core test: **can the reader tell what actually happened, what changed, and why?**
If the sentence sounds impressive but survives deletion without loss, cut it.

---

## 01 — Formulaic, slogan-like, or figurative language

**Flag when:** the claim is understandable but packaged as a stock formula, slogan,
staged cadence, canned emotional phrase, or strained metaphor instead of clear
analysis. Includes colons, semicolons, and em dashes used to manufacture rhythm
rather than clarify meaning.

| Instead of | Write |
|---|---|
| The checklist is not just a tracker—it is the gateway to a more reliable release. | The checklist shows which requirements are complete. |
| The new review process is a pivotal initiative that unlocks a vibrant future by adding two review steps. | The new review process adds two review steps before release. |
| Experts note that teams using this robust framework reach the same decision more often. | The survey found that teams using the framework reached the same decision more often. |

### Patterns to catch

**Inflated contrast / negative parallelism** — the single most common tell:
- "This isn't just a calendar — it's a gateway to a more intentional life."
- "Not X, but Y." / "Not only X, but also Y." / "Not just X, but Y." / "No X, no Y, just Z."
- "It's not X, it's Y."
- "Data access is not a background detail. It's the heart of the user experience."

**Slogan-like fragments and transitions:**
- "One team. One vision. Limitless possibilities."
- "Win the close. Keep the evidence."
- "Pipeline is flat. Spend isn't."
- "From paper-bound practicals to a shared digital workspace."

**Rhetorical triads:** "Faster, smarter, and more intuitive."

**Manufactured rhythm and punctuation:**
- Semicolon chains: "Owners are set; risks are checked; approval is granted — and the launch moves forward."
- Unnecessary em dashes: "Purpose: isolate what changed – and what deliberately stayed in place – under the new policy."
- Colon stacking: "Universities: reinforce guidance. Students: reduce social activity."
- Staged cadence: "Different sectors, same behavioral logic: reduce optional contact where consequences are highest."
- Overlong parallel enumerations that simulate exhaustiveness after the point is already made.

**Artificial tone and figurative wording:**
- Strained metaphors: "Proceed only when five readiness gates are green."
- Canned empathy: "I completely understand how frustrating and overwhelming this must feel."
- Synthetic balance with no real tradeoff: "While remote work offers flexibility, it also presents unique challenges."
- Inflated significance: turning mundane facts into legacy, identity, pivotal moments, or an evolving landscape.
- Promotional / travel-guide adjectives: vibrant, rich, renowned, groundbreaking, nestled.
- Canned endings: generic challenges/legacy/future-outlook conclusions that do not arise from the content.

**Synthetic authority and AI-tell vocabulary:**
- Vague authorities: "Experts argue," "observers note," "scholars say," "several sources suggest."
- Dense clusters of: *delve, pivotal, robust, tapestry, underscore, showcase, foster, intricate, landscape, testament, vibrant.*
- Mechanical `**Label:** explanation` bullet lists where that structure is not useful.

### Do not flag
Constructions that state concrete distinctions, give a clear warning, or quote an
identified source. Parallel structure and punctuation that separates a real list,
contrast, or logical relationship is fine.

- "The bug is in the parser, not the tokenizer."
- "The red light means stop, and the green light means go."

---

## 02 — Vague, inflated, or unsupported substance

**Flag when:** the reader cannot tell what changed, why the benefit follows, what
evidence supports the claim, or what reason drove the decision.

| Instead of | Write |
|---|---|
| The new intake form removes one approval step, unlocking value and driving meaningful impact. | The new intake form removes one approval step. |
| The next guide resets the bar higher by projecting Q2 revenue at $91B. | The next guide projects Q2 revenue at $91B. |
| After extensive review, we aligned on delaying launch until Legal and Security approved the exception. | We delayed launch until Legal and Security approved the exception. |

### Patterns to catch

**Claims without observable support:**
- Empty abstraction: "This unlocks value, fosters alignment, and drives meaningful impact."
- Tacked-on benefit: "The interface centralizes key information, ensuring a seamless user experience."
- Inflated significance: "This represents a profound shift."
- Unnamed authority: "Research consistently shows that this approach improves outcomes" with no source.

**Meaning obscured by shorthand:**
- Informal filler: "Data Center is doing the heavy lifting" → "Most revenue growth comes from data centers."
- Unexplained coinages: "Everyday computer work gets the same agentic loop" — what loop?

**Reasoning lost or replaced:**
- Process instead of reason: "After several rounds of cross-functional review, we aligned on the next phase."
- Oversimplification that destroys meaning: "Where to draw the line on speed investments" → "Where to draw the line."

### Do not flag
Claims supported by a concrete result, source, constraint, or approval requirement.

- "The change removes one approval step."
- "The 12 June accessibility audit found 14 missing labels."

---

## 03 — Wordy, jargon-filled, or indirect language

**Flag when:** the sentence can be shorter and clearer without losing necessary
meaning or a real qualification.

| Instead of | Write |
|---|---|
| At this point in time, it may be advisable for the team to commence the process of reviewing the draft. | The team should review the draft. |
| Events remain anchored to dual capacity constraints: a headcount cap and a percentage cap. | Events are limited by both a headcount cap and a room-capacity percentage. |
| The target state is not one replacement; it is a shared system in which every surface orients around identity, lifecycle, and portable execution. | Every surface can reuse shared identity, lifecycle, and agent execution capabilities. |

### Patterns to catch
- Corporate phrasing: "Stakeholders should be informed of the operational implications associated with this transition."
- Stacked hedging: "It may potentially be worth considering whether the team could possibly delay the launch."
- Compressed abstraction: "The practical event ceiling remains anchored to both a headcount cap and a percentage cap."
- Indirect comparison: "The update reads as a broader continuation of requests rather than a list of named zones."
- Unexplained jargon: "The workflow operationalizes a cross-functional enablement layer for downstream value realization."

### Do not flag
Accurate technical terms, legal conditions, or explained uncertainty.

- "The API returns 429 when the client exceeds the rate limit."
- "The estimate is preliminary because two regions have not reported."

For this blog specifically: TSP, BRS, SDVOSB, SCRA, BAH, and Roth IRA are accurate
terms for the audience. Use them, and define them on first use in a post aimed at
newcomers. Replacing them with vaguer words is a downgrade, not a simplification.

---

## 04 — Unnecessary framing, repetition, or structure

**Flag when:** setup, repetition, or formatting delays the point or makes the post
harder to scan.

| Instead of | Write |
|---|---|
| Before getting started, it is important to understand the broader context: this post covers two decisions. | This post covers the two decisions. |
| In conclusion, the checklist reduced missing fields in the onboarding packet. | The checklist reduced missing fields in the onboarding packet. |

### Patterns to catch
- Generic scene-setting: "In today's fast-paced digital landscape…"
- Restating the request: "When it comes to improving onboarding, there are several strategies to consider."
- Meta-announcement: "Below is a polished and comprehensive rewrite tailored to your needs."
- Redundant conclusion: "In conclusion, adopting these strategies can help organizations achieve their goals."
- Excessive structure: a two-sentence answer split across six headings and twelve bullets.

### Do not flag
Framing that narrows scope, corrects the request, explains an omission, or helps
readers navigate reference material.

- "This post covers the two launch decisions due Friday."

---

## Self-review checklist

Before publishing, read the draft once against each question:

1. **Accuracy** — is every claim correct, internally consistent, and non-contradictory?
2. **Completeness** — does it cover what the post promised in its title and intro?
3. **Contextual fit** — does it match the surrounding site voice: direct, personal, military, specific?
4. **Writing quality** — any formulaic, vague, wordy, jargon-heavy, or repetitive passages?
5. **Specificity** — can you point to exact sentences that earn their place, and cut the ones that don't?

Then run these three passes:

- **Delete test.** Remove each sentence. If nothing is lost, leave it out.
- **Negative-parallelism sweep.** Search the draft for "not just," "isn't just," "not only,"
  and "it's not X, it's Y." Rewrite every hit as a direct statement.
- **Number test.** Every claim about money, time, or results should carry a real figure
  or an honest "I don't know." This blog's credibility rests on real numbers, so vague
  gestures at success cost more here than on a generic finance site.

---

## Note on the source document

Section 05 of the source covers slide design standards for finance, consulting, and
software engineering decks, judged against real Bain, BCG, and Meta slides. That
section is about presentations rather than prose, so it is not reproduced here. Its
transferable lesson: **lead with the conclusion.** A headline that states the finding
("48% of European investors believe equities are overvalued") beats a topic label
("Investor perspectives"). The same applies to blog post titles, section headings,
and the first sentence of every section.
