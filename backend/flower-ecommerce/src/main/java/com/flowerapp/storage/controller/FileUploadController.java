package com.flowerapp.storage.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.storage.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "File Upload", description = "File upload endpoints")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    private final StorageService storageService;

    @PostMapping("/product-image")
    @Operation(summary = "Upload product image")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> uploadProductImage(
            @RequestPart("file") Mono<FilePart> fileMono) {

        log.info("Received product image upload request");

        return fileMono.flatMap(file -> {
            log.info("Processing file: {}", file.filename());
            return storageService.uploadProductImage(file)
                    .map(url -> {
                        Map<String, String> response = new HashMap<>();
                        response.put("url", url);
                        response.put("fileName", file.filename());
                        log.info("Upload successful: {}", url);
                        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
                    });
        }).doOnError(error -> log.error("Upload failed: {}", error.getMessage()));
    }

    @PostMapping("/category-image")
    @Operation(summary = "Upload category image")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> uploadCategoryImage(
            @RequestPart("file") Mono<FilePart> fileMono) {

        log.info("Received category image upload request");

        return fileMono.flatMap(file -> {
            log.info("Processing file: {}", file.filename());
            return storageService.uploadCategoryImage(file)
                    .map(url -> {
                        Map<String, String> response = new HashMap<>();
                        response.put("url", url);
                        response.put("fileName", file.filename());
                        log.info("Upload successful: {}", url);
                        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
                    });
        }).doOnError(error -> log.error("Upload failed: {}", error.getMessage()));
    }

    @DeleteMapping
    @Operation(summary = "Delete uploaded file")
    public Mono<ResponseEntity<ApiResponse<Void>>> deleteFile(@RequestParam String fileUrl) {
        return storageService.deleteFile(fileUrl)
                .map(success -> {
                    if (success) {
                        return ResponseEntity.ok(ApiResponse.<Void>success("File deleted successfully", null));
                    } else {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.<Void>error("Failed to delete file"));
                    }
                });
    }
}