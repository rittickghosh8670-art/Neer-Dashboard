package com.lbs.controller;

import com.lbs.dto.MetricsDto;
import com.lbs.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping
    public MetricsDto getMetrics(
            @RequestParam(defaultValue = "false") boolean isLive,
            @RequestParam(required = false) String instrument,
            @RequestParam(required = false) String sessionWindow,
            @RequestParam(required = false) String signature,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer quarter) {

        boolean anyExtraFilter = sessionWindow != null || signature != null
                || year != null || quarter != null;

        return anyExtraFilter
                ? metricsService.computeMetrics(isLive, instrument, sessionWindow, signature, year, quarter)
                : metricsService.computeMetrics(isLive, instrument);
    }
}
