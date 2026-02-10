package com.flowerapp.storage.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
@Tag(name = "File Upload", description = "File upload endpoints for product images")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);

    @Value("${file.upload.dir:src/main/resources/static/images/products}")
    private String uploadDir;

    @Value("${file.upload.max-size:5242880}")
    private long maxFileSize;

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(
            Arrays.asList("jpg", "jpeg", "png", "webp", "gif")
    );

    /**
     * Upload a single product image
     */
    @PostMapping(value = "/product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Upload product image", description = "Upload a single product image (SUPER_ADMIN only)")
    public ResponseEntity<Map<String, Object>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category) {

        try {
            // Validate file
            validateFile(file);

            // Determine subfolder
            String subFolder = (category != null && !category.trim().isEmpty()) ? category : "general";

            // Create directory
            Path uploadPath = createUploadDirectory(subFolder);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(originalFilename, fileExtension);

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL path
            String imageUrl = "/images/products/" + subFolder + "/" + uniqueFilename;

            log.info("File uploaded successfully: {}", imageUrl);

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image uploaded successfully");

            Map<String, String> data = new HashMap<>();
            data.put("imageUrl", imageUrl);
            data.put("filename", uniqueFilename);
            data.put("originalFilename", originalFilename);
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.badRequest().body(errorResponse);

        } catch (IOException e) {
            log.error("Failed to upload file", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to upload image: " + e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload multiple product images
     */
    @PostMapping(value = "/product-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Upload multiple product images", description = "Upload multiple product images at once")
    public ResponseEntity<Map<String, Object>> uploadMultipleProductImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", required = false) String category) {

        List<Map<String, String>> uploadedFiles = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                validateFile(file);

                String subFolder = (category != null && !category.trim().isEmpty()) ? category : "general";
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

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("uploaded", uploadedFiles);
        responseData.put("errors", errors);
        responseData.put("totalUploaded", uploadedFiles.size());
        responseData.put("totalFailed", errors.size());

        Map<String, Object> response = new HashMap<>();
        response.put("data", responseData);

        if (uploadedFiles.isEmpty()) {
            response.put("success", false);
            response.put("message", "All uploads failed");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("success", true);
        response.put("message", uploadedFiles.size() + " file(s) uploaded successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a product image
     */
    @DeleteMapping("/product-image")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete product image", description = "Delete an uploaded product image")
    public ResponseEntity<Map<String, Object>> deleteProductImage(
            @RequestParam("imageUrl") String imageUrl) {

        try {
            String relativePath = imageUrl.replace("/images/products/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (!Files.exists(filePath)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "File not found");
                response.put("data", null);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Files.delete(filePath);
            log.info("File deleted successfully: {}", imageUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            response.put("data", null);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to delete file: {}", imageUrl, e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete image");
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid filename");
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed types: " + ALLOWED_EXTENSIONS
            );
        }

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
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        String cleanName = originalFilename
                .substring(0, originalFilename.lastIndexOf("."))
                .replaceAll("[^a-zA-Z0-9-_]", "_")
                .toLowerCase();

        if (cleanName.length() > 30) {
            cleanName = cleanName.substring(0, 30);
        }

        return timestamp + "_" + uuid + "_" + cleanName + "." + extension;
    }
}