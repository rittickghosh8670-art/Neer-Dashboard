package com.lbs.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Payload for manually enriching a trade with LBS strategy-specific fields
 * after CSV import (signature, IB type, VWAP side, S/R zones, notes, etc).
 * All fields optional/nullable — only provided fields are updated.
 */
@Getter
@Setter
public class TradeEnrichmentDto {

    private String sessionWindow;
    private String ibType;
    private String vwapSide;
    private String msDirection;
    private String signature;
    private String setupGrade;
    private BigDecimal srZoneLow;
    private BigDecimal srZoneHigh;
    private BigDecimal classicLevel;

    private String srType;
    private String srTouchCount;
    private String srFailureCount;

    private String slPlacement;

    private BigDecimal targetClassicLevelR;
    private BigDecimal targetFurtherSrR;
    private BigDecimal targetIbHighLowR;

    private BigDecimal mgmtNoMoveR;
    private BigDecimal mgmtExtendedTargetR;
    private BigDecimal mgmtPartialBookTrailR;

    private String notes;
}
