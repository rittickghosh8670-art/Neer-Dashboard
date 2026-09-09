package com.lbs.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegimeResultDto {
    private String regime;
    private double confidence;
    private String direction;
    private double avgConditionalVolatility;
    private double unconditionalVolatility;
    private double volatilityRatio;
    private double trendRSquared;
    private boolean isHighVol;
    private boolean isTrending;
}
