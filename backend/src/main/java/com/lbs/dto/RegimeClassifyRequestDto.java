package com.lbs.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Request to classify the market regime of a trade's session using its
 * price series (e.g. 5-minute closing prices spanning the trading window).
 * Price series input is manual since historical bar data is not yet
 * ingested/stored in this system.
 */
@Getter
@Setter
public class RegimeClassifyRequestDto {
    private List<Double> prices;
}
