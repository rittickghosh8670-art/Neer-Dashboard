package com.lbs.service;

import com.lbs.dto.ImportResultDto;
import com.lbs.model.BacktestSession;
import com.lbs.model.Trade;
import com.lbs.repository.BacktestSessionRepository;
import com.lbs.repository.TradeRepository;
import com.lbs.util.SessionWindowClassifier;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Imports FX Replay CSV exports into the trades table.
 * Only raw FX Replay columns are mapped here. LBS-specific fields
 * (signature, IB type, VWAP side, etc.) are left null and must be
 * filled in manually via the enrichment endpoint afterward, since
 * that information does not exist in the FX Replay export.
 */
@Service
@RequiredArgsConstructor
public class CsvImportService {

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")
    );

    private final BacktestSessionRepository backtestSessionRepository;
    private final TradeRepository tradeRepository;

    @Transactional
    public ImportResultDto importCsv(MultipartFile file, String sessionName, String instrument) {
        ImportResultDto result = new ImportResultDto();
        List<String> warnings = new ArrayList<>();

        BacktestSession session = new BacktestSession();
        session.setName(sessionName);
        session.setInstrument(instrument);
        session.setSourceFile(file.getOriginalFilename());
        session = backtestSessionRepository.save(session);
        result.setBacktestSessionId(session.getId());

        int total = 0;
        int imported = 0;
        int skipped = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVReader csvReader = new CSVReader(reader)) {

            String[] header = csvReader.readNext();
            if (header == null) {
                result.addWarning("CSV file is empty.");
                return result;
            }
            Map<String, Integer> colIndex = buildColumnIndex(header);

            String[] row;
            List<Trade> batch = new ArrayList<>();

            while ((row = csvReader.readNext()) != null) {
                total++;
                try {
                    Trade trade = mapRowToTrade(row, colIndex, session, instrument);
                    batch.add(trade);
                    imported++;
                } catch (Exception e) {
                    skipped++;
                    warnings.add("Row " + (total + 1) + " skipped: " + e.getMessage());
                }
            }

            tradeRepository.saveAll(batch);

        } catch (IOException | CsvValidationException e) {
            warnings.add("Failed to read CSV: " + e.getMessage());
        }

        result.setTotalRows(total);
        result.setImportedCount(imported);
        result.setSkippedCount(skipped);
        warnings.forEach(result::addWarning);
        return result;
    }

    private Map<String, Integer> buildColumnIndex(String[] header) {
        Map<String, Integer> index = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            index.put(header[i].trim(), i);
        }
        return index;
    }

    private Trade mapRowToTrade(String[] row, Map<String, Integer> col,
                                 BacktestSession session, String instrument) {
        Trade trade = new Trade();
        trade.setBacktestSession(session);
        trade.setLive(false);
        trade.setInstrument(instrument);

        trade.setExternalId(getString(row, col, "id"));
        trade.setDateStart(getDateTime(row, col, "dateStart", true));
        trade.setDateEnd(getDateTime(row, col, "dateEnd", false));
        trade.setSide(getString(row, col, "side"));
        trade.setEntryPrice(getRequiredDecimal(row, col, "entryPrice"));
        trade.setInitialSl(getDecimal(row, col, "initalSL"));
        trade.setMaxTp(getDecimal(row, col, "maxTP"));
        trade.setIdealTp(getDecimal(row, col, "idealTP"));
        trade.setAvgClosePrice(getDecimal(row, col, "avgClosePrice"));
        trade.setAmount(getDecimal(row, col, "amount"));
        trade.setAmountClosed(getDecimal(row, col, "amountClosed"));
        trade.setStatus(getString(row, col, "status"));
        trade.setRealizedPnl(getDecimal(row, col, "rPnL"));
        trade.setUnrealizedPnl(getDecimal(row, col, "uPnL"));
        trade.setAvgRiskReward(getDecimal(row, col, "avgRiskReward"));
        trade.setMaxRiskReward(getDecimal(row, col, "maxRiskReward"));
        trade.setRawTags(getString(row, col, "tags"));

        // Optional enrichment columns: present only if you've manually added
        // them to the CSV before import (e.g. copy-pasted after backtesting
        // in FX Replay). Missing columns are left null for later manual
        // enrichment via the UI.
        String sessionWindowOverride = getString(row, col, "sessionWindow");
        trade.setSessionWindow(sessionWindowOverride != null
                ? sessionWindowOverride
                : SessionWindowClassifier.classify(trade.getDateStart()));

        trade.setIbType(getString(row, col, "ibType"));
        trade.setVwapSide(getString(row, col, "vwapSide"));
        trade.setMsDirection(getString(row, col, "msDirection"));
        trade.setSignature(getString(row, col, "signature"));
        trade.setSetupGrade(getString(row, col, "setupGrade"));
        trade.setSrZoneLow(getDecimal(row, col, "srZoneLow"));
        trade.setSrZoneHigh(getDecimal(row, col, "srZoneHigh"));
        trade.setClassicLevel(getDecimal(row, col, "classicLevel"));

        trade.setSrType(getString(row, col, "srType"));
        trade.setSrTouchCount(getString(row, col, "srTouchCount"));
        trade.setSrFailureCount(getString(row, col, "srFailureCount"));

        trade.setSlPlacement(getString(row, col, "slPlacement"));

        trade.setTargetClassicLevelR(getDecimal(row, col, "targetClassicLevelR"));
        trade.setTargetFurtherSrR(getDecimal(row, col, "targetFurtherSrR"));
        trade.setTargetIbHighLowR(getDecimal(row, col, "targetIbHighLowR"));

        trade.setMgmtNoMoveR(getDecimal(row, col, "mgmtNoMoveR"));
        trade.setMgmtExtendedTargetR(getDecimal(row, col, "mgmtExtendedTargetR"));
        trade.setMgmtPartialBookTrailR(getDecimal(row, col, "mgmtPartialBookTrailR"));

        trade.setNotes(getString(row, col, "notes"));

        return trade;
    }

    private String getString(String[] row, Map<String, Integer> col, String name) {
        Integer idx = col.get(name);
        if (idx == null || idx >= row.length) {
            return null;
        }
        String val = row[idx];
        return (val == null || val.isBlank()) ? null : val.trim();
    }

    private BigDecimal getDecimal(String[] row, Map<String, Integer> col, String name) {
        String val = getString(row, col, name);
        if (val == null) {
            return null;
        }
        try {
            return new BigDecimal(val);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal getRequiredDecimal(String[] row, Map<String, Integer> col, String name) {
        BigDecimal val = getDecimal(row, col, name);
        if (val == null) {
            throw new IllegalArgumentException("Missing required numeric field: " + name);
        }
        return val;
    }

    private LocalDateTime getDateTime(String[] row, Map<String, Integer> col, String name, boolean required) {
        String val = getString(row, col, name);
        if (val == null) {
            if (required) {
                throw new IllegalArgumentException("Missing required date field: " + name);
            }
            return null;
        }
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try {
                return LocalDateTime.parse(val, fmt);
            } catch (Exception ignored) {
                // try next format
            }
        }
        if (required) {
            throw new IllegalArgumentException("Invalid date format for " + name + ": " + val);
        }
        return null;
    }
}
