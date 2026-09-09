package com.lbs.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp");
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    @Value("${app.upload-dir}")
    private String uploadDir;

    /**
     * Stores an uploaded trade screenshot under {uploadDir}/images/{tradeId}/
     * and returns the relative path to persist on the Trade entity.
     */
    public String storeTradeImage(Long tradeId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds max size of 10MB.");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "image");
        String extension = getExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type: " + extension);
        }

        Path tradeDir = Paths.get(uploadDir, "images", String.valueOf(tradeId));
        Files.createDirectories(tradeDir);

        String fileName = UUID.randomUUID() + "." + extension;
        Path targetPath = tradeDir.resolve(fileName);
        file.transferTo(targetPath);

        return Paths.get("images", String.valueOf(tradeId), fileName).toString();
    }

    public void deleteTradeImage(String relativePath) {
        if (relativePath == null) {
            return;
        }
        try {
            Path path = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Non-fatal: log and continue, orphaned file cleanup can be manual.
        }
    }

    public Path resolveImagePath(String relativePath) {
        return Paths.get(uploadDir, relativePath);
    }

    private String getExtension(String fileName) {
        List<String> parts = List.of(fileName.split("\\."));
        if (parts.size() < 2) {
            return "";
        }
        return parts.get(parts.size() - 1);
    }
}
