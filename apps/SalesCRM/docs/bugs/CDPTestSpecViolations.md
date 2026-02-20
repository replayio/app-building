# Fix: ClientDetailPage Test Spec Directive Violations

## Violations Found

### 1. Unspecified clickable link in timeline user attribution (CDP-TL-01, CDP-TL-02)
**Directive violated**: "For every clickable element, the test entry must specify the exact navigation target or action result."

CDP-TL-01 described user attribution "with link" and CDP-TL-02 stated "'User A' is a clickable link" — but neither specified where the link navigates. The app renders user attribution as a plain `<span>`, not a link, so the spec was inaccurate.

**Fix**: Removed "with link" from CDP-TL-01 and removed "'User A' is a clickable link." from CDP-TL-02.

### 2. Missing timeline entry verification in CDP-QA-07
**Directive violated**: "If the app has a timeline or history feature, every mutation that the timeline tracks must write a history entry."

CDP-QA-07 (attachment upload) did not mention a timeline entry being created, unlike other quick action entries (CDP-QA-03, CDP-QA-05, CDP-QA-09) which all verify timeline entries.

**Fix**: Added "A timeline entry is created for the attachment upload." to CDP-QA-07's Expected section.

### 3. FollowButton entries misplaced under SettingsPage section
CDP-FOL-01/02/03 test entries were placed under the SettingsPage section (section 9) even though they test ClientDetailPage behavior. The FollowButton component was also missing from the ClientDetailPage Components list.

**Fix**: Moved CDP-FOL-01/02/03 entries from SettingsPage to a new `#### FollowButton` subsection under ClientDetailPage. Added **FollowButton** to the ClientDetailPage Components list.

## Files Changed
- `docs/tests.md`: All test spec fixes applied

## Tests
All client-detail-page.spec.ts tests pass (spec-only changes, no code changes needed).
