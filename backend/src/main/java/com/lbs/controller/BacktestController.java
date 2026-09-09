package com.lbs.controller;

import com.lbs.dto.ImportResultDto;
import com.lbs.service.CsvImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/backtest")
@RequiredArgsConstructor
public class BacktestController {

    private final CsvImportService csvImportService;

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<ImportResultDto> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionName") String sessionName,
            @RequestParam("instrument") String instrument) {

        ImportResultDto result = csvImportService.importCsv(file, sessionName, instrument);
        return ResponseEntity.ok(result);
    }
}
