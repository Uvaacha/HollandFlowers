package com.flowerapp.common.controller;

import com.flowerapp.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "File upload endpoints for product images")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    // Configure this in application.properties or application.yml
    @Value("${file.upload.dir:src/main/resources/static/images/products}")
    private String uploadDir;

    @Value("${file.upload.max-size:5242880}") // 5MB default
    private long maxFileSize;

    // Allowed image extensions
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    @PostMapping(value = "/product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Upload product image", description = "Upload a single product image (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category) {

        try {
            // Validate file
            validateFile(file);

            // Determine subfolder based on category (optional)
            String subFolder = category != null && !category.isBlank() ? category : "general";

            // Create directory if it doesn't exist
            Path uploadPath = createUploadDirectory(subFolder);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(originalFilename, fileExtension);

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate the URL path that frontend will use
            String imageUrl = "/images/products/" + subFolder + "/" + uniqueFilename;

            log.info("File uploaded successfully: {}", imageUrl);

            // Return response with the image path
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);

            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), null));
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage(), null));
        }
    }

    @PostMapping(value = "/product-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Upload multiple product images", description = "Upload multiple product images at once")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadMultipleProductImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", required = false) String category) {

        List<Map<String, String>> uploadedFiles = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                validateFile(file);

                String subFolder = category != null && !category.isBlank() ? category : "general";
                Path uploadPath = createUploadDirectory(subFolder);

                String originalFilename = file.getOriginalFilename();
                String fileExtension = getFileExtension(originalFilename);
                String uniqueFilename = generateUniqueFilename(originalFilename, fileExtension);

                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                String imageUrl = "/images/products/" + subFolder + "/" + uniqueFilename;

                Map<String, String> fileInfo = new HashMap<>();
                fileInfo.put("imageUrl", imageUrl);
                fileInfo.put("filename", uniqueFilename);
                fileInfo.put("originalFilename", originalFilename);
                uploadedFiles.add(fileInfo);

                log.info("File uploaded: {}", imageUrl);

            } catch (Exception e) {
                String errorMsg = file.getOriginalFilename() + ": " + e.getMessage();
                errors.add(errorMsg);
                log.error("Failed to upload file: {}", errorMsg);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("uploaded", uploadedFiles);
        response.put("errors", errors);
        response.put("totalUploaded", uploadedFiles.size());
        response.put("totalFailed", errors.size());

        if (uploadedFiles.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("All uploads failed", response));
        }

        return ResponseEntity.ok(ApiResponse.success(
                uploadedFiles.size() + " file(s) uploaded successfully",
                response
        ));
    }

    @DeleteMapping("/product-image")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete product image", description = "Delete an uploaded product image")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(
            @RequestParam("imageUrl") String imageUrl) {

        try {
            // Extract the file path from the URL
            // e.g., "/images/products/general/123456789_flower.jpg" -> "general/123456789_flower.jpg"
            String relativePath = imageUrl.replace("/images/products/", "");

            Path filePath = Paths.get(uploadDir, relativePath);

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Files.delete(filePath);
            log.info("File deleted successfully: {}", imageUrl);

            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));

        } catch (IOException e) {
            log.error("Failed to delete file: {}", imageUrl, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete image", null));
        }
    }

    // ==================== Helper Methods ====================

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    String.format("File size exceeds maximum limit of %d MB",
                            maxFileSize / (1024 * 1024))
            );
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Invalid filename");
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed types: " + ALLOWED_EXTENSIONS
            );
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
    }

    private Path createUploadDirectory(String subFolder) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subFolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath);
        }
        return uploadPath;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String generateUniqueFilename(String originalFilename, String extension) {
        // Generate unique filename: timestamp_uuid_originalname.ext
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        // Clean original filename (remove extension and special chars)
        String cleanName = originalFilename
                .substring(0, originalFilename.lastIndexOf("."))
                .replaceAll("[^a-zA-Z0-9-_]", "_")
                .toLowerCase();

        // Limit name length
        if (cleanName.length() > 30) {
            cleanName = cleanName.substring(0, 30);
        }

        return timestamp + "_" + uuid + "_" + cleanName + "." + extension;
    }
}