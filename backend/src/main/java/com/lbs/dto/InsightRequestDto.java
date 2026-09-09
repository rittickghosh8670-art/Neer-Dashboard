package com.lbs.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class InsightRequestDto {
    private List<Long> tradeIds;
    private String question;
    private boolean includeImageFromTradeId;
}
