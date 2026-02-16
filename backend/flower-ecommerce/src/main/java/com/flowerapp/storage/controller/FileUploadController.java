package com.flowerapp.storage.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class FileUploadController {

    private final StorageService storageService;

    @PostMapping("/product-image")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {

        log.info("=== UPLOAD START - Product Image ===");
        log.info("File: {}, Size: {} bytes, Type: {}",
                file.getOriginalFilename(), file.getSize(), file.getContentType());

        // Convert MultipartFile to FilePart
        FilePart filePart = new ServletFilePartAdapter(file);

        return storageService.uploadProductImage(filePart)
                .map(url -> {
                    log.info("Upload successful: {}", url);
                    Map<String, String> response = new HashMap<>();
                    response.put("url", url);
                    response.put("fileName", file.getOriginalFilename());
                    return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
                })
                .onErrorResume(error -> {
                    log.error("Upload failed:", error);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.error("Upload failed: " + error.getMessage())));
                });
    }

    @PostMapping("/category-image")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> uploadCategoryImage(
            @RequestParam("file") MultipartFile file) {

        log.info("=== UPLOAD START - Category Image ===");
        log.info("File: {}", file.getOriginalFilename());

        FilePart filePart = new ServletFilePartAdapter(file);

        return storageService.uploadCategoryImage(filePart)
                .map(url -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("url", url);
                    response.put("fileName", file.getOriginalFilename());
                    return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
                })
                .onErrorResume(error -> {
                    log.error("Upload failed:", error);
                    return Mono.just(ResponseEntity.status(500)
                            .body(ApiResponse.error("Upload failed: " + error.getMessage())));
                });
    }

    /**
     * Adapter to convert servlet MultipartFile to reactive FilePart
     */
    private static class ServletFilePartAdapter implements FilePart {
        private final MultipartFile multipartFile;
        private final HttpHeaders headers;

        public ServletFilePartAdapter(MultipartFile multipartFile) {
            this.multipartFile = multipartFile;
            this.headers = new HttpHeaders();
            if (multipartFile.getContentType() != null) {
                this.headers.setContentType(MediaType.parseMediaType(multipartFile.getContentType()));
            }
        }

        @Override
        public String filename() {
            return multipartFile.getOriginalFilename();
        }

        @Override
        public Mono<Void> transferTo(Path dest) {
            try {
                multipartFile.transferTo(dest.toFile());
                return Mono.empty();
            } catch (IOException e) {
                return Mono.error(e);
            }
        }

        @Override
        public String name() {
            return multipartFile.getName();
        }

        @Override
        public HttpHeaders headers() {
            return headers;
        }

        @Override
        public Flux<DataBuffer> content() {
            try {
                byte[] bytes = multipartFile.getBytes();
                DataBuffer buffer = new DefaultDataBufferFactory().wrap(bytes);
                return Flux.just(buffer);
            } catch (IOException e) {
                return Flux.error(e);
            }
        }
    }
}