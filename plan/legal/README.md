# Legal drafts

> **⚠️ These are starting-point drafts, not legal advice.** Before publishing on a public website or submitting to App Store / Play Store, have an attorney in your jurisdiction review them — especially the limitation-of-liability and governing-law sections.

## What's in here

| File | Purpose |
| ---- | ------- |
| `privacy-policy.md` | What data is collected, how it's stored, who it's shared with, how users delete it. |
| `terms-of-service.md` | Acceptable use, intellectual property, disclaimers, governing law. |

## How to use

1. Fill in the **bracketed `[...]` placeholders** (company name, contact email, jurisdiction, etc.).
2. Have a lawyer review.
3. Convert to HTML and host at `/privacy` and `/terms` on the production site.
4. Link both from:
   - In-app Settings → Legal
   - The web footer
   - The App Store Connect listing
   - The Play Console Data Safety section
5. Update the "Last updated" line every time you change the policy substantively.

## Notes

- The Privacy Policy is written for a US-based controller with a worldwide audience and explicit GDPR / CCPA awareness.
- The Terms reference Delaware (popular default for US SaaS) — pick your real state.
- Both use plain language where possible. There's a long tradition of dense legalese; we resist it.
