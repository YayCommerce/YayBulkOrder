---
description: Interactive dev workflow — develop an agreed plan checkpoint by checkpoint, with review between each.
---

# /wdev

Workflow - Interactive development. Use this once a plan is agreed (from `/wplan`).

**Read `.claude/docs/context-dev-convention.md` before starting.**

---

## Step 0 — Get the Plan

Check `.claude/plans/` for a plan matching this task.

- **Found**: read it — this gives you the goal, approach, and checkpoints.
- **Not found**: run the `wplan` skill first to create one. Do not proceed to Step 1 until a plan exists and is confirmed.

---

## Step 1 — Branch

Check the current branch (`git branch --show-current`) and develop on it by default.

- If it's `develop` or `main`: create a new branch off it first (see branch naming in the doc) — never commit directly to those.
- Otherwise: stay on the current branch unless the user asks for a new one.

---

## Step 2 — Develop (Checkpoint Loop)

Work through the plan's checkpoints one at a time:

1. Announce which checkpoint you're starting
2. Implement it
3. Before asking for review:
   - **Format** the packages you touched (see "Format Before Commit" in `.claude/docs/context-dev-convention.md`)
   - **Typecheck**: if you touched `apps/app-admin`, run `pnpm --filter @yay-bulk-order/app-admin build:lite` (or `:pro`) — it's the only place `tsc --noEmit` runs
   - **PHP**: run `phpcs --standard=phpcs.xml <changed paths>` if phpcs is installed globally (see the doc); otherwise flag to the user that PHP wasn't linted
   - **Dev server**: tell the user which dev command to run to verify in the browser (`pnpm dev:admin:lite`, `pnpm dev`, or `pnpm dev:pro` depending on what changed — see "Dev Servers" in the doc)
   - There is no unit test runner in this repo — don't claim to have run tests
   - A Stop hook (`.claude/hooks/check-*.sh`) also auto-builds whatever package you touched when you finish responding, and blocks you from finishing if it fails — this is a safety net, not a substitute for checking the build yourself during the checkpoint
4. Present a summary of what was done and what to test:

> **Checkpoint 1 complete: <name>**
>
> Changes:
> - `path/to/file.tsx` — description
>
> Dev server: `pnpm dev:admin:lite`
>
> To test: <specific steps>
>
> Ready for review. Should I continue to checkpoint 2?

5. **Auto-judge after each checkpoint:**
   - **Auto-continue** when: build clean, changes additive (no breaking changes, no data migrations, reversible).
   - **Stop for review** when: breaking change, security-sensitive code (REST permission callbacks, ajax handlers), touches the licensing/Pro-gating code (already fragile — see `context-plugin-list.md`), or hard to reverse.
   - State your call in one line.

If the user finds an issue during review, fix it before moving on. Do not start the next checkpoint until the current one is approved.

If the plan turns out to be wrong or incomplete mid-development, stop and revise it with the user before continuing.

---

## Done

After all checkpoints are approved:

1. Push the branch: `git push -u origin <branch>`
2. Ensure a PR exists targeting `develop` — create one with `gh pr create` if none exists
3. Wait for CI if any is configured (this repo currently has no `.github/workflows`); otherwise skip straight to reporting
4. Report the final result:

> All done. PR #<number> created against `develop`.
