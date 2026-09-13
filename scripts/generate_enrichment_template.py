#!/usr/bin/env python3
"""
Generates the LBS trade enrichment Excel template (templates/trade_enrichment_template.xlsx).

Run: python3 scripts/generate_enrichment_template.py 2>&1

Columns match the enrichment fields read by CsvImportService during CSV
import (backend/src/main/java/com/lbs/service/CsvImportService.java).
Add these columns to your FX Replay CSV export (after the existing raw
columns) and fill them in per trade before importing into the dashboard.
"""

import subprocess
import sys

try:
    import openpyxl
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "openpyxl", "-q"])
    import openpyxl

from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

OUTPUT_PATH = "templates/trade_enrichment_template.xlsx"

# (column_name, column_type, dropdown_options_or_None, comment)
COLUMNS = [
    ("sessionWindow", "text",
     ["01:30-02:30", "03:00-04:30", "14:00-16:00"],
     "LBS trading window. Leave blank to auto-detect from trade time (EST assumed)."),

    ("ibType", "text",
     ["single_break", "double_break", "none"],
     "Initial Balance break type observed for this session (Edgeful IB stats)."),

    ("vwapSide", "text",
     ["above", "below"],
     "Price relative to the 6pm EST anchored VWAP at time of entry."),

    ("msDirection", "text",
     ["uptrend", "downtrend", "range"],
     "5-minute market structure direction (HH/HL, LL/LH, or ranging)."),

    ("signature", "text",
     ["bull180", "bear180", "torpedo", "power_bar"],
     "Entry trigger signature used on the 2-minute chart."),

    ("setupGrade", "text",
     ["A", "B", "C"],
     "Subjective setup quality grade."),

    ("srZoneLow", "number",
     None,
     "Lower boundary price of the S/R zone this trade was based on."),

    ("srZoneHigh", "number",
     None,
     "Upper boundary price of the S/R zone this trade was based on."),

    ("classicLevel", "number",
     None,
     "Classic Level price used as target reference, if applicable."),

    ("srType", "text",
     ["support", "resistance"],
     "Whether the zone acted as support or resistance for this trade."),

    ("srTouchCount", "text",
     ["1", "2", "3", "4", "4+"],
     "Number of times price touched/respected this zone before this trade."),

    ("srFailureCount", "text",
     ["0", "1", "2", "3", "4+"],
     "Number of times price broke through this zone before this trade."),

    ("slPlacement", "text",
     ["above_sr", "candle_high_low", "swing_high_low"],
     "Where the stop loss was placed for this trade."),

    ("targetClassicLevelR", "number",
     None,
     "R outcome when the nearest Classic Level was the applicable target for "
     "this trade. Positive = target hit, negative = stopped out first (e.g. -1 "
     "for a 1R loss). Leave blank if this target type didn't apply to this trade."),

    ("targetFurtherSrR", "number",
     None,
     "R outcome when a further recent S/R zone was the applicable target. "
     "Positive = target hit, negative = stopped out first (e.g. -1). Leave "
     "blank if this target type didn't apply to this trade."),

    ("targetIbHighLowR", "number",
     None,
     "R outcome when the IB high/low was the applicable target. Positive = "
     "target hit, negative = stopped out first (e.g. -1). Leave blank if "
     "this target type didn't apply to this trade."),

    ("mgmtNoMoveR", "number",
     None,
     "R achieved with default management: fixed SL, no trailing (your "
     "actual executed outcome in most trades)."),

    ("mgmtExtendedTargetR", "number",
     None,
     "Hypothetical/actual R if target was extended further without "
     "moving SL. Fill only if you evaluated this alternative on this trade."),

    ("mgmtPartialBookTrailR", "number",
     None,
     "Hypothetical/actual R if 50% was booked and SL trailed to swing "
     "high/low, letting the rest run. Fill only if evaluated on this trade."),

    ("notes", "text",
     None,
     "Free-text observations, mistakes, rationale for this trade."),
]

HEADER_FILL = PatternFill(start_color="1E3A5F", end_color="1E3A5F", fill_type="solid")
HEADER_FONT = Font(color="FFFFFF", bold=True)
TEXT_TYPE_FILL = PatternFill(start_color="F0F4F8", end_color="F0F4F8", fill_type="solid")
NUMBER_TYPE_FILL = PatternFill(start_color="FFF8E8", end_color="FFF8E8", fill_type="solid")


def build_workbook():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Enrichment Template"

    # Header row
    for col_idx, (name, col_type, options, comment) in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=col_idx, value=name)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center")

        if comment:
            cell.comment = openpyxl.comments.Comment(comment, "LBS Dashboard", width=280, height=100)

        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = max(18, len(name) + 4)

        # Type hint row (row 2) purely informational, not imported
        type_cell = ws.cell(row=2, column=col_idx, value=f"({col_type})")
        type_cell.font = Font(italic=True, size=9, color="6B7280")
        type_cell.fill = TEXT_TYPE_FILL if col_type == "text" else NUMBER_TYPE_FILL
        type_cell.alignment = Alignment(horizontal="center")

        # Data validation dropdown for enum columns, applied to a large
        # row range so it keeps working as you add more trades.
        if options:
            dv = DataValidation(
                type="list",
                formula1='"' + ",".join(options) + '"',
                allow_blank=True,
                showDropDown=False,
            )
            dv.error = f"Value must be one of: {', '.join(options)}"
            dv.errorTitle = "Invalid entry"
            ws.add_data_validation(dv)
            dv.add(f"{col_letter}3:{col_letter}1000")

    ws.freeze_panes = "A3"

    # Second sheet: quick reference / instructions
    ref = wb.create_sheet("Instructions")
    ref["A1"] = "LBS Trade Enrichment Template — Instructions"
    ref["A1"].font = Font(bold=True, size=13)

    instructions = [
        "",
        "1. Fill one row per trade in the 'Enrichment Template' sheet, starting at row 3,",
        "   in the SAME ORDER as the rows in your FX Replay CSV export.",
        "2. Copy these filled columns and paste them as additional columns into your FX Replay",
        "   CSV export (after the existing columns), so both live in a single CSV file.",
        "3. Import that combined CSV via the dashboard's Import CSV page.",
        "4. Columns with dropdowns (blue-highlighted headers) restrict input to valid values",
        "   only, preventing typos that would otherwise fail to match during import.",
        "",
        "Target R columns: fill only the ONE that matches the target actually reached.",
        "Management R columns: fill mgmtNoMoveR with your actual outcome (default),",
        "  optionally also fill mgmtExtendedTargetR / mgmtPartialBookTrailR as hypothetical",
        "  'what if I managed it differently' comparisons on the same trade.",
        "",
        "Use negative numbers for losses in all R columns (e.g. -1 for a 1R loss),",
        "not the word 'loss' — this keeps the data numeric for Analytics aggregation.",
    ]
    for i, line in enumerate(instructions, start=2):
        ref.cell(row=i, column=1, value=line)
    ref.column_dimensions["A"].width = 100

    wb.save(OUTPUT_PATH)
    print(f"Template written to {OUTPUT_PATH}")


if __name__ == "__main__":
    build_workbook()
