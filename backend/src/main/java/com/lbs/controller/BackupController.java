package com.lbs.controller;

import com.lbs.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @PostMapping
    public Map<String, String> create() throws IOException, InterruptedException {
        String fileName = backupService.createBackup();
        return Map.of("fileName", fileName);
    }

    @GetMapping
    public List<BackupService.BackupInfo> list() throws IOException {
        return backupService.listBackups();
    }

    @GetMapping("/{fileName}/download")
    public ResponseEntity<Resource> download(@PathVariable String fileName) throws IOException {
        Path path = backupService.resolveBackupPath(fileName);
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(path.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @PostMapping(value = "/restore", consumes = "multipart/form-data")
    public Map<String, String> restore(@RequestParam("file") MultipartFile file)
            throws IOException, InterruptedException {
        Path tempFile = Files.createTempFile("lbs_restore_", ".sql");
        try {
            file.transferTo(tempFile);
            backupService.restoreBackup(tempFile);
            return Map.of("status", "restored");
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }
}
