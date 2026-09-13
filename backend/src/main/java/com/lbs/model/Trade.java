package com.lbs.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
@Getter
@Setter
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "backtest_session_id")
    @JsonIgnore
    private BacktestSession backtestSession;

    /**
     * Exposes just the backtest session ID to the frontend without
     * triggering lazy-loading of the full BacktestSession entity
     * (which would fail once the Hibernate session is closed, since
     * JSON serialization happens after the transaction ends).
     *
     * Deliberately NOT named getBacktestSessionId() -- Spring Data JPA's
     * query derivation for TradeRepository.findByBacktestSessionId(...)
     * matches method/property names by convention, and a same-named
     * getter here causes it to misresolve the property path against a
     * non-existent flat attribute instead of traversing
     * backtestSession.id, breaking startup query validation.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("backtestSessionId")
    public Long resolveBacktestSessionId() {
        return backtestSession != null ? backtestSession.getId() : null;
    }

    @Column(name = "is_live", nullable = false)
    private boolean isLive = false;

    // --- FX Replay raw fields ---
    @Column(name = "external_id")
    private String externalId;

    @Column(name = "date_start", nullable = false)
    private LocalDateTime dateStart;

    @Column(name = "date_end")
    private LocalDateTime dateEnd;

    @Column(nullable = false)
    private String instrument;

    @Column(nullable = false)
    private String side;

    @Column(name = "entry_price", nullable = false)
    private BigDecimal entryPrice;

    @Column(name = "initial_sl")
    private BigDecimal initialSl;

    @Column(name = "max_tp")
    private BigDecimal maxTp;

    @Column(name = "ideal_tp")
    private BigDecimal idealTp;

    @Column(name = "avg_close_price")
    private BigDecimal avgClosePrice;

    private BigDecimal amount;

    @Column(name = "amount_closed")
    private BigDecimal amountClosed;

    private String status;

    @Column(name = "realized_pnl")
    private BigDecimal realizedPnl;

    @Column(name = "unrealized_pnl")
    private BigDecimal unrealizedPnl;

    @Column(name = "avg_risk_reward")
    private BigDecimal avgRiskReward;

    @Column(name = "max_risk_reward")
    private BigDecimal maxRiskReward;

    @Column(name = "raw_tags")
    private String rawTags;

    // --- LBS strategy fields ---
    @Column(name = "session_window")
    private String sessionWindow;

    @Column(name = "ib_type")
    private String ibType;

    @Column(name = "vwap_side")
    private String vwapSide;

    @Column(name = "ms_direction")
    private String msDirection;

    private String signature;

    @Column(name = "setup_grade")
    private String setupGrade;

    @Column(name = "sr_zone_low")
    private BigDecimal srZoneLow;

    @Column(name = "sr_zone_high")
    private BigDecimal srZoneHigh;

    @Column(name = "classic_level")
    private BigDecimal classicLevel;

    // --- Entry basis: categorical "why" this entry was taken ---
    @Column(name = "entry_basis")
    private String entryBasis;

    // --- S/R zone quality ---
    @Column(name = "sr_type")
    private String srType;

    @Column(name = "sr_touch_count")
    private String srTouchCount;

    @Column(name = "sr_failure_count")
    private String srFailureCount;

    // --- SL placement ---
    @Column(name = "sl_placement")
    private String slPlacement;

    // --- Target / management R outcomes (actual + hypothetical, multiple may be filled) ---
    @Column(name = "target_classic_level_r")
    private BigDecimal targetClassicLevelR;

    @Column(name = "target_further_sr_r")
    private BigDecimal targetFurtherSrR;

    @Column(name = "target_ib_high_low_r")
    private BigDecimal targetIbHighLowR;

    @Column(name = "mgmt_no_move_r")
    private BigDecimal mgmtNoMoveR;

    @Column(name = "mgmt_extended_target_r")
    private BigDecimal mgmtExtendedTargetR;

    @Column(name = "mgmt_partial_book_trail_r")
    private BigDecimal mgmtPartialBookTrailR;

    // --- Regime tagging ---
    private String regime;

    @Column(name = "regime_confidence")
    private BigDecimal regimeConfidence;

    // --- Journal ---
    @Column(name = "image_path")
    private String imagePath;

    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
