---
name: Releases process
description: How every wave/release is documented and versioned in the Orca project
type: preference
---
Every wave/major feature completion MUST:
1. Create `docs/releases/vX.Y.Z-codinome.md` from `docs/releases/_TEMPLATE.md`
2. Update the index `docs/releases/README.md`
3. Update the status table in `docs/ROADMAP.md`
4. Bump `version` in `package.json`
5. If user-facing copy is added/changed, update `docs/marketing/` accordingly

Versioning (semver, pre-1.0):
- `0.MINOR.0` = new wave from roadmap (visible user change)
- `0.MINOR.PATCH` = smaller adjustment in same wave
- `v1.0.0` = commercial launch

**Why:** the user will announce the app publicly and needs detailed marketing material, store descriptions, and a clean changelog history. Documentation is part of "done".

**How to apply:** after finishing any wave, do the 5 steps above BEFORE saying the wave is complete.
