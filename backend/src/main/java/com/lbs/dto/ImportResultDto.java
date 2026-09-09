package com.lbs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDto {

    private Long backtestSessionId;
    private int totalRows;
    private int importedCount;
    private int skippedCount;
    private List<String> warnings = new ArrayList<>();

    public void addWarning(String warning) {
        this.warnings.add(warning);
    }
}
