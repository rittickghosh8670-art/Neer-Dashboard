package com.lbs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsDto {

    private int totalTrades;
    private int wins;
    private int losses;
    private BigDecimal winRate;
    private BigDecimal profitFactor;
    private BigDecimal expectancy;
    private BigDecimal sharpeRatio;
    private BigDecimal maxDrawdown;
    private BigDecimal maxDrawdownPct;
    private BigDecimal avgRiskReward;
    private BigDecimal totalPnl;
    private BigDecimal avgWin;
    private BigDecimal avgLoss;
    private BigDecimal largestWin;
    private BigDecimal largestLoss;

    private List<EquityPoint> equityCurve;
    private Map<String, BigDecimal> pnlByDay;
    private Map<String, MetricsDto> breakdownBySessionWindow;
    private Map<String, MetricsDto> breakdownBySignature;
    private Map<String, MetricsDto> breakdownByRegime;
    private Map<String, MetricsDto> breakdownByEntryBasis;
    private Map<String, MetricsDto> breakdownBySetupGrade;
    private Map<String, MetricsDto> breakdownBySrType;
    private Map<String, MetricsDto> breakdownByIbType;
    private Map<String, MetricsDto> breakdownByVwapSide;
    private Map<String, MetricsDto> breakdownByMsDirection;
    private Map<String, MetricsDto> breakdownBySlPlacement;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquityPoint {
        private String date;
        private BigDecimal cumulativePnl;
    }
}

