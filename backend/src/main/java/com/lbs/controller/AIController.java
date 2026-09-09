package com.lbs.controller;

import com.lbs.dto.InsightRequestDto;
import com.lbs.service.AIInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIInsightService aiInsightService;

    @PostMapping("/insight")
    public Map<String, Object> getInsight(@RequestBody InsightRequestDto request) {
        return aiInsightService.generateInsight(
                request.getTradeIds(),
                request.getQuestion(),
                request.isIncludeImageFromTradeId()
        );
    }
}
