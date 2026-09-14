package com.lbs.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Database backup/restore via pg_dump / psql. Requires the postgresql-client
 * tools to be available on PATH (bundled in the backend Docker image; must
 * be installed separately if running the backend outside Docker).
 *
 * Backups are plain SQL dumps (custom format would be more compact, but
 * plain SQL is easiest to inspect/move between machines with psql alone).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BackupService {

    private static final DateTimeFormatter FILE_TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final long PROCESS_TIMEOUT_SECONDS = 120;

    @Value("${app.backup-dir}")
    private String backupDir;

    @Value("${app.db.host}")
    private String dbHost;

    @Value("${app.db.port}")
    private String dbPort;

    @Value("${app.db.name}")
    private String dbName;

    @Value("${app.db.user}")
    private String dbUser;

    @Value("${app.db.password}")
    private String dbPassword;

    public String createBackup() throws IOException, InterruptedException {
        Path dir = Paths.get(backupDir);
        Files.createDirectories(dir);

        String fileName = "lbs_backup_" + LocalDateTime.now().format(FILE_TIMESTAMP) + ".sql";
        Path outputPath = dir.resolve(fileName);

        ProcessBuilder pb = new ProcessBuilder(
                "pg_dump",
                "-h", dbHost,
                "-p", dbPort,
                "-U", dbUser,
                "-d", dbName,
                "-F", "p",
                "--clean",
                "--if-exists",
                "-f", outputPath.toString()
        );
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        boolean finished = process.waitFor(PROCESS_TIMEOUT_SECONDS, TimeUnit.SECONDS);

        log.info("pg_dump output for {}: {}", fileName, output);

        if (!finished) {
            process.destroyForcibly();
            throw new IOException("pg_dump timed out after " + PROCESS_TIMEOUT_SECONDS + "s");
        }
        if (process.exitValue() != 0) {
            Files.deleteIfExists(outputPath);
            throw new IOException("pg_dump failed: " + output);
        }

        return fileName;
    }

    public List<BackupInfo> listBackups() throws IOException {
        Path dir = Paths.get(backupDir);
        if (!Files.exists(dir)) {
            return List.of();
        }

        List<BackupInfo> backups = new ArrayList<>();
        try (var stream = Files.list(dir)) {
            stream.filter(p -> p.toString().endsWith(".sql"))
                    .forEach(p -> {
                        File f = p.toFile();
                        backups.add(new BackupInfo(f.getName(), f.length(), f.lastModified()));
                    });
        }
        backups.sort(Comparator.comparingLong(BackupInfo::lastModified).reversed());
        return backups;
    }

    public Path resolveBackupPath(String fileName) {
        // Prevent path traversal: only allow simple filenames within backupDir.
        String safeName = Paths.get(fileName).getFileName().toString();
        return Paths.get(backupDir, safeName);
    }

    public void restoreBackup(Path sqlFilePath) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "psql",
                "-h", dbHost,
                "-p", dbPort,
                "-U", dbUser,
                "-d", dbName,
                "-v", "ON_ERROR_STOP=1",
                "-f", sqlFilePath.toString()
        );
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        boolean finished = process.waitFor(PROCESS_TIMEOUT_SECONDS, TimeUnit.SECONDS);

        log.info("psql restore output: {}", output);

        if (!finished) {
            process.destroyForcibly();
            throw new IOException("psql restore timed out after " + PROCESS_TIMEOUT_SECONDS + "s");
        }
        if (process.exitValue() != 0) {
            throw new IOException("psql restore failed (exit " + process.exitValue() + "): " + output);
        }
    }

    public record BackupInfo(String fileName, long sizeBytes, long lastModified) {
    }
}
