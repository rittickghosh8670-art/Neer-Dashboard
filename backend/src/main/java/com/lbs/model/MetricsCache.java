package com.lbs.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "metrics_cache")
@Getter
@Setter
public class MetricsCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String scope;

    @Column(name = "win_rate")
    private BigDecimal winRate;

    @Column(name = "profit_factor")
    private BigDecimal profitFactor;

    private BigDecimal expectancy;

    @Column(name = "sharpe_ratio")
    private BigDecimal sharpeRatio;

    @Column(name = "max_drawdown")
    private BigDecimal maxDrawdown;

    @Column(name = "avg_rr")
    private BigDecimal avgRr;

    @Column(name = "total_trades")
    private Integer totalTrades;

    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt = LocalDateTime.now();
}
