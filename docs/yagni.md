# Deliberately not built (yet)

| Not built                                                       | Why not now                                                                                        | Revisit when                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Major upgrades: AI SDK 7, `@ai-sdk/*` 4, Vitest 5, TypeScript 7 | Same-major patches fix the audit advisories; majors need migration work with no user-visible gain. | A needed feature or a security fix exists only in the new major.   |
| Full Content-Security-Policy                                    | Inline JSON-LD and the theme script would need nonces, which forces dynamic rendering.             | The site embeds third-party scripts or user-generated HTML.        |
| Distributed per-IP chat rate limiting in Redis                  | Per-instance memory limits + a Redis daily cap are proportionate at portfolio traffic.             | Abuse shows up in `/admin` or provider quota alerts.               |
| Storing chat question free text                                 | Visitors may type personal data; topics + chip labels answer "what do people ask about".           | Owner explicitly wants raw questions and the privacy page says so. |
| Separate `/projects/<id>` pages for workplace agents            | Private codebases, no repo/media; an anchored section is enough.                                   | There is public material (demo, write-up) worth its own URL.       |
