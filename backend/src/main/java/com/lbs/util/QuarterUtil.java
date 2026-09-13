package com.lbs.util;

import java.time.LocalDateTime;
import java.time.Month;

/**
 * Converts a (year, quarter) filter pair into an inclusive-start /
 * exclusive-end LocalDateTime range for filtering Trade.dateStart.
 * Calendar quarters: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec.
 */
public final class QuarterUtil {

    public record DateRange(LocalDateTime start, LocalDateTime end) {
    }

    private QuarterUtil() {
    }

    /**
     * Returns null if both year and quarter are null (no date filtering).
     * If only year is provided, returns the full calendar year range.
     * If quarter is provided without year, throws IllegalArgumentException
     * since a quarter alone is ambiguous.
     */
    public static DateRange resolve(Integer year, Integer quarter) {
        if (year == null && quarter == null) {
            return null;
        }
        if (year == null) {
            throw new IllegalArgumentException("year is required when quarter is specified");
        }
        if (quarter == null) {
            LocalDateTime start = LocalDateTime.of(year, Month.JANUARY, 1, 0, 0);
            LocalDateTime end = LocalDateTime.of(year + 1, Month.JANUARY, 1, 0, 0);
            return new DateRange(start, end);
        }
        if (quarter < 1 || quarter > 4) {
            throw new IllegalArgumentException("quarter must be between 1 and 4, got: " + quarter);
        }

        int startMonth = (quarter - 1) * 3 + 1;
        LocalDateTime start = LocalDateTime.of(year, startMonth, 1, 0, 0);
        LocalDateTime end = start.plusMonths(3);
        return new DateRange(start, end);
    }
}
