package com.lbs.controller;

import com.lbs.dto.RegimeClassifyRequestDto;
import com.lbs.dto.RegimeResultDto;
import com.lbs.model.Trade;
import com.lbs.service.PythonBridgeService;
import com.lbs.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/regime")
@RequiredArgsConstructor
public class RegimeController {

    private final PythonBridgeService pythonBridgeService;
    private final TradeService tradeService;

    /**
     * Classifies the regime for a price series without persisting it.
     * Useful for ad-hoc exploration before committing to a trade.
     */
    @PostMapping("/classify")
    public RegimeResultDto classify(@RequestBody RegimeClassifyRequestDto request) {
        return pythonBridgeService.classifyRegime(request.getPrices());
    }

    /**
     * Classifies the regime for a price series and persists the result
     * onto the given trade's regime / regimeConfidence fields.
     */
    @PostMapping("/classify/{tradeId}")
    public Trade classifyAndApply(@PathVariable Long tradeId, @RequestBody RegimeClassifyRequestDto request) {
        RegimeResultDto result = pythonBridgeService.classifyRegime(request.getPrices());
        return tradeService.applyRegime(tradeId, result.getRegime(), result.getConfidence());
    }
}
