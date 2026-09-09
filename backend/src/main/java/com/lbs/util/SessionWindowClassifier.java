package com.lbs.util;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Classifies a trade's start time into one of the LBS trading windows (EST).
 * Trade timestamps from FX Replay are assumed to already be in EST.
 */
public final class SessionWindowClassifier {

    public static final String WINDOW_1 = "01:30-02:30";
    public static final String WINDOW_2 = "03:00-04:30";
    public static final String WINDOW_3 = "14:00-16:00";

    private static final LocalTime W1_START = LocalTime.of(1, 30);
    private static final LocalTime W1_END = LocalTime.of(2, 30);
    private static final LocalTime W2_START = LocalTime.of(3, 0);
    private static final LocalTime W2_END = LocalTime.of(4, 30);
    private static final LocalTime W3_START = LocalTime.of(14, 0);
    private static final LocalTime W3_END = LocalTime.of(16, 0);

    private SessionWindowClassifier() {
    }

    /**
     * Returns the matching session window label, or null if the trade
     * start time falls outside all defined LBS trading windows.
     */
    public static String classify(LocalDateTime dateStart) {
        if (dateStart == null) {
            return null;
        }
        LocalTime t = dateStart.toLocalTime();

        if (isWithin(t, W1_START, W1_END)) {
            return WINDOW_1;
        }
        if (isWithin(t, W2_START, W2_END)) {
            return WINDOW_2;
        }
        if (isWithin(t, W3_START, W3_END)) {
            return WINDOW_3;
        }
        return null;
    }

    private static boolean isWithin(LocalTime t, LocalTime start, LocalTime end) {
        return !t.isBefore(start) && !t.isAfter(end);
    }
}
