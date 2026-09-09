package com.lbs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payload for manually logging a live trade. Unlike backtest trades
 * (bulk-imported from FX Replay CSV), live trades are entered one at a
 * time as they happen, including the LBS strategy fields up front since
 * you have that context in real time.
 */
@Getter
@Setter
public class LiveTradeCreateDto {

    @NotNull
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;

    @NotBlank
    private String instrument;

    @NotBlank
    private String side;

    @NotNull
    private BigDecimal entryPrice;

    private BigDecimal initialSl;
    private BigDecimal maxTp;
    private BigDecimal idealTp;
    private BigDecimal avgClosePrice;
    private BigDecimal amount;
    private BigDecimal amountClosed;
    private String status;
    private BigDecimal realizedPnl;
    private BigDecimal unrealizedPnl;
    private BigDecimal avgRiskReward;
    private BigDecimal maxRiskReward;

    private String sessionWindow;
    private String ibType;
    private BigDecimal ibLevel;
    private String vwapSide;
    private String msDirection;
    private String signature;
    private String setupGrade;
    private Short confluenceCount;
    private BigDecimal srZoneLow;
    private BigDecimal srZoneHigh;
    private BigDecimal classicLevel;
    private String notes;
}
