package com.lbs.service;

import com.lbs.model.Trade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIInsightService {

    private final TradeService tradeService;
    private final ImageService imageService;
    private final PythonBridgeService pythonBridgeService;

    public Map<String, Object> generateInsight(List<Long> tradeIds, String question, boolean includeImage) {
        List<Trade> trades = tradeIds.stream().map(tradeService::findById).toList();

        List<Map<String, Object>> tradeRecords = trades.stream()
                .map(this::toRecord)
                .toList();

        String imageBase64 = null;
        String imageMediaType = null;

        if (includeImage) {
            Trade withImage = trades.stream()
                    .filter(t -> t.getImagePath() != null)
                    .findFirst()
                    .orElse(null);

            if (withImage != null) {
                try {
                    Path path = imageService.resolveImagePath(withImage.getImagePath());
                    byte[] bytes = Files.readAllBytes(path);
                    imageBase64 = Base64.getEncoder().encodeToString(bytes);
                    imageMediaType = detectMediaType(withImage.getImagePath());
                } catch (IOException e) {
                    // Non-fatal: proceed without image if it can't be read.
                }
            }
        }

        return pythonBridgeService.analyzeInsight(tradeRecords, question, imageBase64, imageMediaType);
    }

    private Map<String, Object> toRecord(Trade t) {
        Map<String, Object> record = new HashMap<>();
        record.put("id", t.getId());
        record.put("instrument", t.getInstrument());
        record.put("side", t.getSide());
        record.put("dateStart", t.getDateStart());
        record.put("realizedPnl", t.getRealizedPnl());
        record.put("avgRiskReward", t.getAvgRiskReward());
        record.put("sessionWindow", t.getSessionWindow());
        record.put("ibType", t.getIbType());
        record.put("vwapSide", t.getVwapSide());
        record.put("msDirection", t.getMsDirection());
        record.put("signature", t.getSignature());
        record.put("setupGrade", t.getSetupGrade());
        record.put("entryBasis", t.getEntryBasis());
        record.put("srType", t.getSrType());
        record.put("srTouchCount", t.getSrTouchCount());
        record.put("srFailureCount", t.getSrFailureCount());
        record.put("slPlacement", t.getSlPlacement());
        record.put("targetClassicLevelR", t.getTargetClassicLevelR());
        record.put("targetFurtherSrR", t.getTargetFurtherSrR());
        record.put("targetIbHighLowR", t.getTargetIbHighLowR());
        record.put("mgmtNoMoveR", t.getMgmtNoMoveR());
        record.put("mgmtExtendedTargetR", t.getMgmtExtendedTargetR());
        record.put("mgmtPartialBookTrailR", t.getMgmtPartialBookTrailR());
        record.put("regime", t.getRegime());
        record.put("regimeConfidence", t.getRegimeConfidence());
        record.put("notes", t.getNotes());
        return record;
    }


    private String detectMediaType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/png";
    }
}
