# Fix: Stage Naming Inconsistency — 'Proposal' vs 'Proposal Sent'

## Violation Found

The `proposal` stage had inconsistent display labels across the application. Some components used `'Proposal Sent'` while others used `'Proposal'`.

**Components using 'Proposal Sent' (correct)**:
- `DealStageBadge` — badge on deal cards in deals list
- `DealsFilterControls` — stage filter dropdown
- `CreateDealModal` — stage selection in deal creation form

**Components using 'Proposal' (incorrect)**:
- `DealsPipelineView` — Kanban column header
- `DealHistorySection` — stage labels in deal history entries
- `StagePipeline` — horizontal pipeline in deal detail
- `DealDetailHeader` — stage selector dropdown on deal detail page

**Test spec using 'Proposal' (incorrect)**:
- DLP-HDR-02, DLP-VW-02, DDP-HDR-04, DDP-PIP-01, DDP-PIP-02, DDP-HIS-02

**Test code using 'Proposal' (incorrect)**:
- `stageDisplayNames` maps in `deals-list-page.spec.ts` and `deal-detail-page.spec.ts`

## Fix

Standardized all occurrences to `'Proposal Sent'` to match the canonical labels in DealStageBadge, DealsFilterControls, and CreateDealModal.

## Files Changed

- `src/components/deals/DealsPipelineView.tsx`: Changed pipeline stage label from 'Proposal' to 'Proposal Sent'
- `src/components/deal-detail/DealHistorySection.tsx`: Changed stage label from 'Proposal' to 'Proposal Sent'
- `src/components/deal-detail/StagePipeline.tsx`: Changed stage label from 'Proposal' to 'Proposal Sent'
- `src/components/deal-detail/DealDetailHeader.tsx`: Changed stage label from 'Proposal' to 'Proposal Sent'
- `tests/deals-list-page.spec.ts`: Updated stageDisplayNames map
- `tests/deal-detail-page.spec.ts`: Updated stageDisplayNames maps (2 occurrences)
- `docs/tests.md`: Updated DLP-HDR-02, DLP-VW-02, DDP-HDR-04, DDP-PIP-01, DDP-PIP-02, DDP-HIS-02 to use 'Proposal Sent'

## Tests

All deals-list-page.spec.ts and deal-detail-page.spec.ts tests pass after the fix.
