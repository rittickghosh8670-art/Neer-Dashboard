package com.lbs.service;

import com.lbs.dto.MetricsDto;
import com.lbs.model.Trade;
import com.lbs.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Computes trade performance metrics: win rate, profit factor, expectancy,
 * Sharpe ratio, max drawdown, equity curve, PnL calendar, and breakdowns
 * by session window / signature / regime.
 *
 * Sharpe ratio here is a per-trade Sharpe (mean PnL / stddev PnL), not
 * annualized against a fixed trading calendar, since trades are intraday
 * scalps with irregular frequency. It's useful as a relative comparison
 * metric across regimes/setups rather than an absolute annualized figure.
 */
@Service
@RequiredArgsConstructor
public class MetricsService {

    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final TradeRepository tradeRepository;

    public MetricsDto computeMetrics(boolean isLive, String instrument) {
        List<Trade> trades = instrument != null
                ? tradeRepository.findByInstrumentAndIsLive(instrument, isLive)
                : tradeRepository.findByIsLive(isLive);

        return compute(trades, true);
    }

    private MetricsDto compute(List<Trade> trades, boolean includeBreakdowns) {
        List<Trade> closed = trades.stream()
                .filter(t -> t.getRealizedPnl() != null)
                .sorted(Comparator.comparing(Trade::getDateStart))
                .collect(Collectors.toList());

        if (closed.isEmpty()) {
            return MetricsDto.builder()
                    .totalTrades(0)
                    .wins(0)
                    .losses(0)
                    .winRate(BigDecimal.ZERO)
                    .profitFactor(BigDecimal.ZERO)
                    .expectancy(BigDecimal.ZERO)
                    .sharpeRatio(BigDecimal.ZERO)
                    .maxDrawdown(BigDecimal.ZERO)
                    .maxDrawdownPct(BigDecimal.ZERO)
                    .avgRiskReward(BigDecimal.ZERO)
                    .totalPnl(BigDecimal.ZERO)
                    .avgWin(BigDecimal.ZERO)
                    .avgLoss(BigDecimal.ZERO)
                    .largestWin(BigDecimal.ZERO)
                    .largestLoss(BigDecimal.ZERO)
                    .equityCurve(List.of())
                    .pnlByDay(Map.of())
                    .build();
        }

        List<BigDecimal> pnls = closed.stream().map(Trade::getRealizedPnl).collect(Collectors.toList());

        int wins = 0;
        int losses = 0;
        BigDecimal grossProfit = BigDecimal.ZERO;
        BigDecimal grossLoss = BigDecimal.ZERO;
        BigDecimal largestWin = BigDecimal.ZERO;
        BigDecimal largestLoss = BigDecimal.ZERO;

        for (BigDecimal pnl : pnls) {
            if (pnl.compareTo(BigDecimal.ZERO) > 0) {
                wins++;
                grossProfit = grossProfit.add(pnl);
                if (pnl.compareTo(largestWin) > 0) largestWin = pnl;
            } else if (pnl.compareTo(BigDecimal.ZERO) < 0) {
                losses++;
                grossLoss = grossLoss.add(pnl.abs());
                if (pnl.abs().compareTo(largestLoss) > 0) largestLoss = pnl.abs();
            }
        }

        int total = closed.size();
        BigDecimal winRate = pct(wins, total);
        BigDecimal profitFactor = grossLoss.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.divide(grossLoss, 4, RoundingMode.HALF_UP)
                : (grossProfit.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal("999.99") : BigDecimal.ZERO);

        BigDecimal avgWin = wins > 0 ? grossProfit.divide(BigDecimal.valueOf(wins), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal avgLoss = losses > 0 ? grossLoss.divide(BigDecimal.valueOf(losses), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal winRateFrac = winRate.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
        BigDecimal lossRateFrac = BigDecimal.ONE.subtract(winRateFrac);
        BigDecimal expectancy = winRateFrac.multiply(avgWin).subtract(lossRateFrac.multiply(avgLoss));

        BigDecimal totalPnl = pnls.stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgRr = closed.stream()
                .map(Trade::getAvgRiskReward)
                .filter(rr -> rr != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long rrCount = closed.stream().filter(t -> t.getAvgRiskReward() != null).count();
        avgRr = rrCount > 0 ? avgRr.divide(BigDecimal.valueOf(rrCount), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal sharpe = computeSharpe(pnls);

        List<MetricsDto.EquityPoint> equityCurve = new ArrayList<>();
        BigDecimal running = BigDecimal.ZERO;
        BigDecimal peak = BigDecimal.ZERO;
        BigDecimal maxDrawdown = BigDecimal.ZERO;
        BigDecimal maxDrawdownPct = BigDecimal.ZERO;

        for (Trade t : closed) {
            running = running.add(t.getRealizedPnl());
            equityCurve.add(MetricsDto.EquityPoint.builder()
                    .date(t.getDateStart().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .cumulativePnl(running)
                    .build());

            if (running.compareTo(peak) > 0) {
                peak = running;
            }
            BigDecimal drawdown = peak.subtract(running);
            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
                maxDrawdownPct = peak.compareTo(BigDecimal.ZERO) != 0
                        ? drawdown.divide(peak, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO;
            }
        }

        Map<String, BigDecimal> pnlByDay = new LinkedHashMap<>();
        for (Trade t : closed) {
            String day = t.getDateStart().toLocalDate().format(DAY_FORMAT);
            pnlByDay.merge(day, t.getRealizedPnl(), BigDecimal::add);
        }

        MetricsDto.MetricsDtoBuilder builder = MetricsDto.builder()
                .totalTrades(total)
                .wins(wins)
                .losses(losses)
                .winRate(winRate)
                .profitFactor(profitFactor)
                .expectancy(expectancy)
                .sharpeRatio(sharpe)
                .maxDrawdown(maxDrawdown)
                .maxDrawdownPct(maxDrawdownPct)
                .avgRiskReward(avgRr)
                .totalPnl(totalPnl)
                .avgWin(avgWin)
                .avgLoss(avgLoss)
                .largestWin(largestWin)
                .largestLoss(largestLoss)
                .equityCurve(equityCurve)
                .pnlByDay(pnlByDay);

        if (includeBreakdowns) {
            builder.breakdownBySessionWindow(breakdownBy(closed, Trade::getSessionWindow));
            builder.breakdownBySignature(breakdownBy(closed, Trade::getSignature));
            builder.breakdownByRegime(breakdownBy(closed, Trade::getRegime));
        }

        return builder.build();
    }

    private Map<String, MetricsDto> breakdownBy(List<Trade> trades, Function<Trade, String> keyFn) {
        Map<String, List<Trade>> grouped = trades.stream()
                .filter(t -> keyFn.apply(t) != null)
                .collect(Collectors.groupingBy(keyFn, LinkedHashMap::new, Collectors.toList()));

        Map<String, MetricsDto> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            result.put(entry.getKey(), compute(entry.getValue(), false));
        }
        return result;
    }

    private BigDecimal computeSharpe(List<BigDecimal> pnls) {
        if (pnls.size() < 2) {
            return BigDecimal.ZERO;
        }
        double mean = pnls.stream().mapToDouble(BigDecimal::doubleValue).average().orElse(0);
        double variance = pnls.stream()
                .mapToDouble(p -> Math.pow(p.doubleValue() - mean, 2))
                .sum() / (pnls.size() - 1);
        double stdDev = Math.sqrt(variance);

        if (stdDev == 0) {
            return BigDecimal.ZERO;
        }
        double sharpe = (mean / stdDev) * Math.sqrt(pnls.size());
        return new BigDecimal(sharpe, new MathContext(6)).setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal pct(int part, int total) {
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(part)
                .divide(BigDecimal.valueOf(total), 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
