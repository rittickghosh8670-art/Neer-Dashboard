package com.lbs.controller;

import com.lbs.dto.BacktestSessionDto;
import com.lbs.dto.ImportResultDto;
import com.lbs.service.BacktestSessionService;
import com.lbs.service.CsvImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/backtest")
@RequiredArgsConstructor
public class BacktestController {

    private final CsvImportService csvImportService;
    private final BacktestSessionService backtestSessionService;

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<ImportResultDto> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionName") String sessionName,
            @RequestParam("instrument") String instrument) {

        ImportResultDto result = csvImportService.importCsv(file, sessionName, instrument);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sessions")
    public List<BacktestSessionDto> listSessions() {
        return backtestSessionService.findAll();
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        backtestSessionService.deleteSession(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
