package com.lbs.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BacktestSessionDto {
    private Long id;
    private String name;
    private String instrument;
    private LocalDateTime importedAt;
    private String sourceFile;
    private int tradeCount;
}
