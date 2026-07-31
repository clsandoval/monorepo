# Engine coverage report

Generated: 2026-07-31T13:46:32.777Z

Regenerate with:

```bash
bash apps/inheritance/scripts/coverage-report.sh
```

**Regions, not branches.** Stable Rust coverage instrumentation is region-based, so the
`Branches` column of `llvm-cov report` is empty on stable — MC/DC branch counters need a nightly
flag. A coverage *region* is the finest granularity stable Rust can report, and it is what this
table measures. **There is no percentage threshold anywhere in this report or in gate G12.**
COV-04 asks which parts of each module no test enters; picking a target percentage would be an
ungrounded decision, so none is made.

| Module | Regions | Uncovered regions | Lines | Uncovered lines | Functions | Uncovered functions |
|---|---:|---:|---:|---:|---:|---:|
| `src/flags.rs` | 538 | 3 | 358 | 1 | 39 | 1 |
| `src/fraction.rs` | 492 | 25 | 276 | 19 | 62 | 6 |
| `src/main.rs` | 54 | 54 | 32 | 32 | 6 | 6 |
| `src/output_check.rs` | 200 | 1 | 154 | 1 | 14 | 0 |
| `src/pipeline.rs` | 516 | 220 | 388 | 156 | 9 | 3 |
| `src/step1_classify.rs` | 944 | 4 | 660 | 2 | 76 | 0 |
| `src/step10_finalize.rs` | 1537 | 12 | 1056 | 6 | 119 | 3 |
| `src/step2_lines.rs` | 1117 | 17 | 659 | 9 | 73 | 4 |
| `src/step3_scenario.rs` | 651 | 1 | 520 | 1 | 58 | 0 |
| `src/step4_estate_base.rs` | 1138 | 9 | 543 | 12 | 48 | 0 |
| `src/step5_legitimes.rs` | 1877 | 3 | 1247 | 3 | 111 | 0 |
| `src/step6_validation.rs` | 1936 | 23 | 1287 | 22 | 83 | 0 |
| `src/step7_distribute.rs` | 3015 | 68 | 1528 | 38 | 126 | 4 |
| `src/step8_collation.rs` | 1431 | 17 | 791 | 18 | 36 | 2 |
| `src/step9_vacancy.rs` | 1808 | 173 | 1099 | 127 | 88 | 4 |
| `src/types.rs` | 49 | 28 | 35 | 12 | 6 | 2 |
| `src/wasm.rs` | 52 | 52 | 39 | 39 | 6 | 6 |
| **TOTAL (17 modules)** | 17355 | 710 | 10672 | 498 | 960 | 41 |

Modules where every region is uncovered are declared, with a reason, in
`apps/inheritance/coverage-zero.lock`. That ledger may only shrink.

### Uncovered functions — `src/flags.rs`

- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine5flags17detect_spec_flagss3_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine5flags17detect_spec_flagss4_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine5flags17detect_spec_flagss4_0B5_`

### Uncovered functions — `src/fraction.rs`

- `_RNCINvXsa_NtCsgmBpYVsZBk3_18inheritance_engine8fractionNtB8_4FracNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeQINtNtCs6muWVFCuwiX_10serde_json2de12DeserializerNtNtB24_4read7StrReadEE0Ba_`
- `_RNCINvXsa_NtCsgmBpYVsZBk3_18inheritance_engine8fractionNtB8_4FracNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeQINtNtCs6muWVFCuwiX_10serde_json2de12DeserializerNtNtB24_4read7StrReadEEs_0Ba_`
- `_RNCINvXsa_NtCshd3LUNNtmJM_18inheritance_engine8fractionNtB8_4FracNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeQINtNtCs6muWVFCuwiX_10serde_json2de12DeserializerNtNtB24_4read7StrReadEE0Ba_`
- `_RNCINvXsa_NtCshd3LUNNtmJM_18inheritance_engine8fractionNtB8_4FracNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeQINtNtCs6muWVFCuwiX_10serde_json2de12DeserializerNtNtB24_4read7StrReadEEs_0Ba_`
- `_RNvMNtCsgmBpYVsZBk3_18inheritance_engine8fractionNtB2_4Frac11as_rational`
- `_RNvMNtCsgmBpYVsZBk3_18inheritance_engine8fractionNtB2_4Frac13from_rational`
- `_RNvMNtCsgmBpYVsZBk3_18inheritance_engine8fractionNtB2_4Frac13into_rational`
- `_RNvMNtCshd3LUNNtmJM_18inheritance_engine8fractionNtB2_4Frac11as_rational`
- `_RNvMNtCshd3LUNNtmJM_18inheritance_engine8fractionNtB2_4Frac13from_rational`
- `_RNvMNtCshd3LUNNtmJM_18inheritance_engine8fractionNtB2_4Frac13into_rational`
- `_RNvMNtCshd3LUNNtmJM_18inheritance_engine8fractionNtB2_4Frac19to_centavos_rounded`
- `_RNvMNtCshd3LUNNtmJM_18inheritance_engine8fractionNtB2_4Frac3abs`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine8fraction13bankers_round`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine8fraction16frac_to_centavos`
- `_RNvXs7_NtCshd3LUNNtmJM_18inheritance_engine8fractionNtB5_4FracNtNtCs27Vx93FoQ6z_4core3fmt7Display3fmt`
- `_RNvXs8_NtCsgmBpYVsZBk3_18inheritance_engine8fractionNtB5_4FracNtNtCs27Vx93FoQ6z_4core3fmt5Debug3fmt`
- `_RNvXs8_NtCshd3LUNNtmJM_18inheritance_engine8fractionNtB5_4FracNtNtCs27Vx93FoQ6z_4core3fmt5Debug3fmt`

### Uncovered functions — `src/main.rs`

- `_RNCNvCs8hDnHhfWxjy_18inheritance_engine4main0B3_`
- `_RNCNvCs8hDnHhfWxjy_18inheritance_engine4mains0_0B3_`
- `_RNCNvCs8hDnHhfWxjy_18inheritance_engine4mains1_0B3_`
- `_RNCNvCs8hDnHhfWxjy_18inheritance_engine4mains2_0B3_`
- `_RNCNvCs8hDnHhfWxjy_18inheritance_engine4mains_0B3_`
- `_RNCNvCsd2Hoi3BYlOB_18inheritance_engine4main0B3_`
- `_RNCNvCsd2Hoi3BYlOB_18inheritance_engine4mains0_0B3_`
- `_RNCNvCsd2Hoi3BYlOB_18inheritance_engine4mains1_0B3_`
- `_RNCNvCsd2Hoi3BYlOB_18inheritance_engine4mains2_0B3_`
- `_RNCNvCsd2Hoi3BYlOB_18inheritance_engine4mains_0B3_`
- `_RNvCs8hDnHhfWxjy_18inheritance_engine4main`
- `_RNvCsd2Hoi3BYlOB_18inheritance_engine4main`

### Uncovered functions — `src/output_check.rs`

- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine12output_check12check_outputs1_0B5_`

### Uncovered functions — `src/pipeline.rs`

- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine8pipeline12run_pipeline0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine8pipeline25run_pipeline_with_restart0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine8pipeline25run_pipeline_with_restarts_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine8pipeline25run_pipeline_with_restart0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine8pipeline25run_pipeline_with_restarts_0B5_`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine8pipeline25run_pipeline_with_restart`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine8pipeline20run_pipeline_checked`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine8pipeline25run_pipeline_with_restart`

### Uncovered functions — `src/step10_finalize.rs`

- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine15step10_finalize15step10_finalizes1_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine15step10_finalize15step10_finalizes6_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine15step10_finalize15step10_finalizesd_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine15step10_finalize15step10_finalizese_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine15step10_finalize15step10_finalizesf_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize15step10_finalizes1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize15step10_finalizesd_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize15step10_finalizese_0B5_`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize14spouse_article`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize15format_fraction`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize16unicode_fraction`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine15step10_finalize21filiation_description`

### Uncovered functions — `src/step2_lines.rs`

- `_RNCNvNtNtCsgmBpYVsZBk3_18inheritance_engine11step2_lines5testss_24test_dead_spouse_no_line0B7_`
- `_RNCNvNtNtCsgmBpYVsZBk3_18inheritance_engine11step2_lines5testss_37test_renounced_heir_no_representation0B7_`
- `_RNCNvNtNtCsgmBpYVsZBk3_18inheritance_engine11step2_lines5testss_45test_all_grandchildren_renounced_line_extinct0B7_`
- `_RNvNtNtCsgmBpYVsZBk3_18inheritance_engine11step2_lines5tests10ineligible`

### Uncovered functions — `src/step5_legitimes.rs`

- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine15step5_legitimes23divide_among_ascendantss1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine15step5_legitimes23divide_among_ascendantss2_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine15step5_legitimes23divide_among_ascendantss3_0B5_`

### Uncovered functions — `src/step6_validation.rs`

- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step6_validation19step6_validate_will0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation16strip_conditions0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation16strip_conditionss0_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation16strip_conditionss1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation16strip_conditionss2_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation18reduce_inofficiouss0_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation18reduce_inofficiouss1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step6_validation18reduce_inofficiouss_0B5_`

### Uncovered functions — `src/step7_distribute.rs`

- `_RNCNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute12get_lc_lines00B7_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute12get_lc_lines0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute16step7_distributes1_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute23determine_will_coverages0_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute23distribute_nephews_only0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute28distribute_other_collaterals0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute28distribute_other_collateralss0_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute28distribute_other_collateralss1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute13distribute_i90B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute13distribute_i9s_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute14distribute_i100B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute14distribute_i10s0_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute14distribute_i10s_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute23distribute_nephews_only0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute39distribute_siblings_with_representation0B5_`
- `_RNCNvNtNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute5tests10find_shares_0B7_`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute14distribute_i14`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute20compute_devise_value`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute23distribute_nephews_only`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine16step7_distribute28distribute_other_collaterals`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute13distribute_i9`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute14distribute_i10`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute20compute_devise_value`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute23distribute_nephews_only`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine16step7_distribute39distribute_siblings_with_representation`

### Uncovered functions — `src/step8_collation.rs`

- `_RNCNvNtNtCsgmBpYVsZBk3_18inheritance_engine15step8_collation5tests15find_adjustments_0B7_`
- `_RNvNtNtCsgmBpYVsZBk3_18inheritance_engine15step8_collation5tests17make_distribution`

### Uncovered functions — `src/step9_vacancy.rs`

- `_RNCNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess7_00B7_`
- `_RNCNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess7_0s_0B7_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy16try_substitutions0_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy16try_substitutions1_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy16try_substitutions2_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy16try_substitutions3_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess7_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess8_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy16try_substitutions0_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy16try_substitutions1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy16try_substitutions2_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy16try_substitutions3_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy16try_substitutions_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess0_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess1_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine13step9_vacancy23step9_resolve_vacanciess6_0B5_`

### Uncovered functions — `src/types.rs`

- `_RINvXNtCsgmBpYVsZBk3_18inheritance_engine5typesNtB3_5MoneyNtNtCs3gJwEGhMpAz_10serde_core3ser9Serialize9serializepEB5_`
- `_RINvXNtCshd3LUNNtmJM_18inheritance_engine5typesNtB3_5MoneyNtNtCs3gJwEGhMpAz_10serde_core3ser9Serialize9serializeQINtNtCs6muWVFCuwiX_10serde_json3ser10SerializerNtNtNtCs75vJTIYSa2J_3std2io5stdio6StdoutNtB1Q_15PrettyFormatterEECs8hDnHhfWxjy_18inheritance_engine`
- `_RINvXNtCshd3LUNNtmJM_18inheritance_engine5typesNtB3_5MoneyNtNtCs3gJwEGhMpAz_10serde_core3ser9Serialize9serializeQINtNtCs6muWVFCuwiX_10serde_json3ser10SerializerQINtNtCsgW8esjfipvk_5alloc3vec3VechEEEB5_`
- `_RINvXs_NtCsgmBpYVsZBk3_18inheritance_engine5typesNtB5_5MoneyNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializepEB7_`
- `_RINvXs_NtCshd3LUNNtmJM_18inheritance_engine5typesNtB5_5MoneyNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeINtNvNtNtCsfewvJe76aFQ_5serde7private2de13missing_field24MissingFieldDeserializerNtNtCs6muWVFCuwiX_10serde_json5error5ErrorEEB7_`
- `_RNCINvXs_NtCsgmBpYVsZBk3_18inheritance_engine5typesNtB7_5MoneyNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializepE0B9_`
- `_RNCINvXs_NtCshd3LUNNtmJM_18inheritance_engine5typesNtB7_5MoneyNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeINtNvNtNtCsfewvJe76aFQ_5serde7private2de13missing_field24MissingFieldDeserializerNtNtCs6muWVFCuwiX_10serde_json5error5ErrorEE0B9_`
- `_RNCINvXs_NtCshd3LUNNtmJM_18inheritance_engine5typesNtB7_5MoneyNtNtCs3gJwEGhMpAz_10serde_core2de11Deserialize11deserializeQINtNtCs6muWVFCuwiX_10serde_json2de12DeserializerNtNtB21_4read7StrReadEE0B9_`

### Uncovered functions — `src/wasm.rs`

- `_RNCNCNvNtCsgmBpYVsZBk3_18inheritance_engine4wasm12compute_jsons_00B7_`
- `_RNCNCNvNtCshd3LUNNtmJM_18inheritance_engine4wasm12compute_jsons_00B7_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine4wasm12compute_json0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine4wasm12compute_jsons0_0B5_`
- `_RNCNvNtCsgmBpYVsZBk3_18inheritance_engine4wasm12compute_jsons_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine4wasm12compute_json0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine4wasm12compute_jsons0_0B5_`
- `_RNCNvNtCshd3LUNNtmJM_18inheritance_engine4wasm12compute_jsons_0B5_`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine4wasm12compute_json`
- `_RNvNtCsgmBpYVsZBk3_18inheritance_engine4wasm12engine_error`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine4wasm12compute_json`
- `_RNvNtCshd3LUNNtmJM_18inheritance_engine4wasm12engine_error`
