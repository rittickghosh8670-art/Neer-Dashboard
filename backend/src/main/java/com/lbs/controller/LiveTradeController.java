package com.lbs.controller;

import com.lbs.dto.LiveTradeCreateDto;
import com.lbs.model.Trade;
import com.lbs.service.TradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/live")
@RequiredArgsConstructor
public class LiveTradeController {

    private final TradeService tradeService;

    @GetMapping
    public List<Trade> list() {
        return tradeService.findAll(true);
    }

    @PostMapping
    public ResponseEntity<Trade> create(@Valid @RequestBody LiveTradeCreateDto dto) {
        Trade trade = tradeService.createLiveTrade(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(trade);
    }

    @PutMapping("/{id}")
    public Trade update(@PathVariable Long id, @RequestBody LiveTradeCreateDto dto) {
        return tradeService.updateLiveTrade(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tradeService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
