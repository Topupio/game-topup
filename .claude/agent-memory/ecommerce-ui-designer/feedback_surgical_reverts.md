---
name: surgical-revert-via-head-baseline
description: For "revert layout, keep behavior" tasks, restore the file from git HEAD and re-apply behavior edits — do not hand-unwind the redesign
metadata:
  type: feedback
---

When asked to revert a layout/redesign in a file while preserving behavior changes made in the same uncommitted working set, restore the file from `git show HEAD:<path>` and then re-apply only the behavior hunks on top. Do not try to hand-edit the redesigned markup back toward the original.

**Why:** The redesign touched dozens of className strings, wrapper divs, and extracted consts. Hand-unwinding leaves residue (stray `p-5 sm:p-6`, `gap-3`, `shrink-0`, orphaned consts) that is invisible in review. Rebuilding from HEAD makes the final `git diff` contain *only* the behavior changes, which is self-verifying.

**How to apply:** Only valid when the layout being reverted is uncommitted (present in `git diff`, not in HEAD). Confirm with `git diff --stat` first. After re-applying behavior, the final `git diff` should show zero className/JSX-structure churn — if it shows any, something was missed. Verify with the project's own checks (`npx tsc --noEmit -p .` and `npx eslint <file>` from `frontend/`).
