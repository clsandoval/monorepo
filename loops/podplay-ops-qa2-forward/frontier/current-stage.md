# Current Stage

current: 8
total: 85

## Completed
- 001: Schema Verification — 7 mismatches documented in frontier/schema-audit.md
- 002: Removal Manifest — 4 features catalogued in frontier/removal-manifest.md
- 003: Remove CC Terminal Component — deleted CcTerminalOrder.tsx, removed tab, cleaned all type/toast/loader/validation/settings/test references
- 004: Remove CC Terminal Types & Labels — removed cc_save_success and cc_save_error from validation-messages.ts procurementToast; no CC entries found in enum-labels, toast-messages, confirmation-dialogs, or types
- 005: Remove CC Terminal Tests — updated tabs.test.ts: renamed "all 6" to "all 5", removed CC Terminals button assertion and tab click test; FD-CC-TERMINAL BOM SKU references in generation.test.ts left intact (hardware item, not procurement tab); 1011 tests pass
- 006: Remove Replay Sign Component — deleted ReplaySignFulfillment.tsx, removed 'Replay Signs' tab from PROCUREMENT_TABS and import from procurement.tsx; tsc --noEmit passes
- 007: Remove Replay Sign Types & Labels — removed 7 TOAST_REPLAY_SIGNS_* constants from toast-messages.ts; removed replay_signs block from procurement validation, replay_signs from advance checklist, replay_save_success/error from procurementToast, and replay_sign_multiplier from settings.system in validation-messages.ts; tsc --noEmit passes
