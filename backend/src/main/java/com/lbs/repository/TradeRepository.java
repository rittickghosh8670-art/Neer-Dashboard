package com.lbs.repository;

import com.lbs.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    List<Trade> findByIsLive(boolean isLive);

    List<Trade> findByBacktestSessionId(Long backtestSessionId);

    List<Trade> findByInstrumentAndIsLive(String instrument, boolean isLive);

    @Query("SELECT t FROM Trade t WHERE t.isLive = :isLive " +
           "AND (:instrument IS NULL OR t.instrument = :instrument) " +
           "AND (:sessionWindow IS NULL OR t.sessionWindow = :sessionWindow) " +
           "AND (:signature IS NULL OR t.signature = :signature) " +
           "AND (:regime IS NULL OR t.regime = :regime) " +
           "AND (:rangeStart IS NULL OR t.dateStart >= :rangeStart) " +
           "AND (:rangeEnd IS NULL OR t.dateStart < :rangeEnd)")
    List<Trade> findWithFilters(
            @Param("isLive") boolean isLive,
            @Param("instrument") String instrument,
            @Param("sessionWindow") String sessionWindow,
            @Param("signature") String signature,
            @Param("regime") String regime,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd
    );
}
