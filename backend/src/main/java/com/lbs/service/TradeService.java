package com.lbs.service;

import com.lbs.dto.LiveTradeCreateDto;
import com.lbs.dto.TradeEnrichmentDto;
import com.lbs.model.Trade;
import com.lbs.repository.TradeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeRepository tradeRepository;
    private final ImageService imageService;

    public List<Trade> findAll(boolean isLive) {
        return tradeRepository.findByIsLive(isLive);
    }

    public List<Trade> findWithFilters(boolean isLive, String instrument, String sessionWindow,
                                        String signature, String regime) {
        return tradeRepository.findWithFilters(isLive, instrument, sessionWindow, signature, regime);
    }

    public Trade findById(Long id) {
        return tradeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trade not found: " + id));
    }

    @Transactional
    public Trade enrich(Long id, TradeEnrichmentDto dto) {
        Trade trade = findById(id);

        if (dto.getSessionWindow() != null) trade.setSessionWindow(dto.getSessionWindow());
        if (dto.getIbType() != null) trade.setIbType(dto.getIbType());
        if (dto.getIbLevel() != null) trade.setIbLevel(dto.getIbLevel());
        if (dto.getVwapSide() != null) trade.setVwapSide(dto.getVwapSide());
        if (dto.getMsDirection() != null) trade.setMsDirection(dto.getMsDirection());
        if (dto.getSignature() != null) trade.setSignature(dto.getSignature());
        if (dto.getSetupGrade() != null) trade.setSetupGrade(dto.getSetupGrade());
        if (dto.getConfluenceCount() != null) trade.setConfluenceCount(dto.getConfluenceCount());
        if (dto.getSrZoneLow() != null) trade.setSrZoneLow(dto.getSrZoneLow());
        if (dto.getSrZoneHigh() != null) trade.setSrZoneHigh(dto.getSrZoneHigh());
        if (dto.getClassicLevel() != null) trade.setClassicLevel(dto.getClassicLevel());
        if (dto.getNotes() != null) trade.setNotes(dto.getNotes());

        return tradeRepository.save(trade);
    }

    @Transactional
    public Trade attachImage(Long id, MultipartFile file) throws IOException {
        Trade trade = findById(id);

        if (trade.getImagePath() != null) {
            imageService.deleteTradeImage(trade.getImagePath());
        }

        String relativePath = imageService.storeTradeImage(id, file);
        trade.setImagePath(relativePath);
        return tradeRepository.save(trade);
    }

    @Transactional
    public void delete(Long id) {
        Trade trade = findById(id);
        if (trade.getImagePath() != null) {
            imageService.deleteTradeImage(trade.getImagePath());
        }
        tradeRepository.delete(trade);
    }

    @Transactional
    public Trade applyRegime(Long id, String regime, double confidence) {
        Trade trade = findById(id);
        trade.setRegime(regime);
        trade.setRegimeConfidence(java.math.BigDecimal.valueOf(confidence));
        return tradeRepository.save(trade);
    }

    @Transactional
    public Trade createLiveTrade(LiveTradeCreateDto dto) {
        Trade trade = new Trade();
        trade.setLive(true);
        trade.setInstrument(dto.getInstrument());
        trade.setSide(dto.getSide());
        trade.setDateStart(dto.getDateStart());
        trade.setDateEnd(dto.getDateEnd());
        trade.setEntryPrice(dto.getEntryPrice());
        trade.setInitialSl(dto.getInitialSl());
        trade.setMaxTp(dto.getMaxTp());
        trade.setIdealTp(dto.getIdealTp());
        trade.setAvgClosePrice(dto.getAvgClosePrice());
        trade.setAmount(dto.getAmount());
        trade.setAmountClosed(dto.getAmountClosed());
        trade.setStatus(dto.getStatus() != null ? dto.getStatus() : "closed");
        trade.setRealizedPnl(dto.getRealizedPnl());
        trade.setUnrealizedPnl(dto.getUnrealizedPnl());
        trade.setAvgRiskReward(dto.getAvgRiskReward());
        trade.setMaxRiskReward(dto.getMaxRiskReward());

        trade.setSessionWindow(dto.getSessionWindow() != null
                ? dto.getSessionWindow()
                : com.lbs.util.SessionWindowClassifier.classify(dto.getDateStart()));
        trade.setIbType(dto.getIbType());
        trade.setIbLevel(dto.getIbLevel());
        trade.setVwapSide(dto.getVwapSide());
        trade.setMsDirection(dto.getMsDirection());
        trade.setSignature(dto.getSignature());
        trade.setSetupGrade(dto.getSetupGrade());
        trade.setConfluenceCount(dto.getConfluenceCount());
        trade.setSrZoneLow(dto.getSrZoneLow());
        trade.setSrZoneHigh(dto.getSrZoneHigh());
        trade.setClassicLevel(dto.getClassicLevel());
        trade.setNotes(dto.getNotes());

        return tradeRepository.save(trade);
    }

    @Transactional
    public Trade updateLiveTrade(Long id, LiveTradeCreateDto dto) {
        Trade trade = findById(id);
        if (!trade.isLive()) {
            throw new IllegalArgumentException("Trade " + id + " is not a live trade.");
        }

        applyIfNotNull(dto.getDateStart(), trade::setDateStart);
        applyIfNotNull(dto.getDateEnd(), trade::setDateEnd);
        applyIfNotNull(dto.getInstrument(), trade::setInstrument);
        applyIfNotNull(dto.getSide(), trade::setSide);
        applyIfNotNull(dto.getEntryPrice(), trade::setEntryPrice);
        applyIfNotNull(dto.getInitialSl(), trade::setInitialSl);
        applyIfNotNull(dto.getMaxTp(), trade::setMaxTp);
        applyIfNotNull(dto.getIdealTp(), trade::setIdealTp);
        applyIfNotNull(dto.getAvgClosePrice(), trade::setAvgClosePrice);
        applyIfNotNull(dto.getAmount(), trade::setAmount);
        applyIfNotNull(dto.getAmountClosed(), trade::setAmountClosed);
        applyIfNotNull(dto.getStatus(), trade::setStatus);
        applyIfNotNull(dto.getRealizedPnl(), trade::setRealizedPnl);
        applyIfNotNull(dto.getUnrealizedPnl(), trade::setUnrealizedPnl);
        applyIfNotNull(dto.getAvgRiskReward(), trade::setAvgRiskReward);
        applyIfNotNull(dto.getMaxRiskReward(), trade::setMaxRiskReward);
        applyIfNotNull(dto.getSessionWindow(), trade::setSessionWindow);
        applyIfNotNull(dto.getIbType(), trade::setIbType);
        applyIfNotNull(dto.getIbLevel(), trade::setIbLevel);
        applyIfNotNull(dto.getVwapSide(), trade::setVwapSide);
        applyIfNotNull(dto.getMsDirection(), trade::setMsDirection);
        applyIfNotNull(dto.getSignature(), trade::setSignature);
        applyIfNotNull(dto.getSetupGrade(), trade::setSetupGrade);
        applyIfNotNull(dto.getConfluenceCount(), trade::setConfluenceCount);
        applyIfNotNull(dto.getSrZoneLow(), trade::setSrZoneLow);
        applyIfNotNull(dto.getSrZoneHigh(), trade::setSrZoneHigh);
        applyIfNotNull(dto.getClassicLevel(), trade::setClassicLevel);
        applyIfNotNull(dto.getNotes(), trade::setNotes);

        return tradeRepository.save(trade);
    }

    private <T> void applyIfNotNull(T value, Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
