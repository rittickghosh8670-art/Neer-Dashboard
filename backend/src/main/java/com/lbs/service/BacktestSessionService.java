package com.lbs.service;

import com.lbs.dto.BacktestSessionDto;
import com.lbs.model.BacktestSession;
import com.lbs.model.Trade;
import com.lbs.repository.BacktestSessionRepository;
import com.lbs.repository.TradeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BacktestSessionService {

    private final BacktestSessionRepository backtestSessionRepository;
    private final TradeRepository tradeRepository;
    private final ImageService imageService;

    public List<BacktestSessionDto> findAll() {
        return backtestSessionRepository.findAll().stream()
                .map(s -> new BacktestSessionDto(
                        s.getId(),
                        s.getName(),
                        s.getInstrument(),
                        s.getImportedAt(),
                        s.getSourceFile(),
                        tradeRepository.findByBacktestSessionId(s.getId()).size()
                ))
                .sorted(Comparator.comparing(BacktestSessionDto::getImportedAt).reversed())
                .toList();
    }

    /**
     * Deletes a backtest session and all its trades (DB cascade handles the
     * trade rows via ON DELETE CASCADE). Trade screenshot files on disk are
     * not covered by the DB cascade, so they're cleaned up explicitly first.
     */
    @Transactional
    public void deleteSession(Long sessionId) {
        BacktestSession session = backtestSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Backtest session not found: " + sessionId));

        List<Trade> trades = tradeRepository.findByBacktestSessionId(sessionId);
        for (Trade trade : trades) {
            if (trade.getImagePath() != null) {
                imageService.deleteTradeImage(trade.getImagePath());
            }
        }

        backtestSessionRepository.delete(session);
    }
}
