package com.flowerapp.storage.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final StorageService storageService;

    @PostMapping("/product-image")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> uploadProductImage(
            @RequestPart("file") Mono<FilePart> fileMono) {

        log.info("=== UPLOAD REQUEST RECEIVED ===");

        return fileMono
                .doOnNext(file -> log.info("File name: {}", file.filename()))
                .flatMap(storageService::uploadProductImage)
                .map(url -> {
                    log.info("Upload success: {}", url);
                    Map<String, String> response = new HashMap<>();
                    response.put("url", url);
                    response.put("fileName", "uploaded");
                    return ResponseEntity.ok(ApiResponse.success("Uploaded", response));
                })
                .doOnError(e -> log.error("Upload error: ", e));
    }

    @PostMapping("/category-image")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> uploadCategoryImage(
            @RequestPart("file") Mono<FilePart> fileMono) {

        return fileMono
                .flatMap(storageService::uploadCategoryImage)
                .map(url -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("url", url);
                    response.put("fileName", "uploaded");
                    return ResponseEntity.ok(ApiResponse.success("Uploaded", response));
                });
    }

    @DeleteMapping
    public Mono<ResponseEntity<ApiResponse<Void>>> deleteFile(@RequestParam String fileUrl) {
        return storageService.deleteFile(fileUrl)
                .map(success -> success
                        ? ResponseEntity.ok(ApiResponse.<Void>success("Deleted", null))
                        : ResponseEntity.badRequest().body(ApiResponse.<Void>error("Failed")));
    }
}