package com.lbs.controller;

import com.lbs.dto.TradeEnrichmentDto;
import com.lbs.model.Trade;
import com.lbs.service.ImageService;
import com.lbs.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;
    private final ImageService imageService;

    @GetMapping
    public List<Trade> list(
            @RequestParam(defaultValue = "false") boolean isLive,
            @RequestParam(required = false) String instrument,
            @RequestParam(required = false) String sessionWindow,
            @RequestParam(required = false) String signature,
            @RequestParam(required = false) String regime,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer quarter) {

        boolean anyFilter = instrument != null || sessionWindow != null
                || signature != null || regime != null || year != null || quarter != null;

        return anyFilter
                ? tradeService.findWithFilters(isLive, instrument, sessionWindow, signature, regime, year, quarter)
                : tradeService.findAll(isLive);
    }

    @GetMapping("/{id}")
    public Trade get(@PathVariable Long id) {
        return tradeService.findById(id);
    }

    @PatchMapping("/{id}")
    public Trade enrich(@PathVariable Long id, @RequestBody TradeEnrichmentDto dto) {
        return tradeService.enrich(id, dto);
    }

    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    public Trade uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        return tradeService.attachImage(id, file);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> getImage(@PathVariable Long id) throws MalformedURLException {
        Trade trade = tradeService.findById(id);
        if (trade.getImagePath() == null) {
            return ResponseEntity.notFound().build();
        }
        Path path = imageService.resolveImagePath(trade.getImagePath());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tradeService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
