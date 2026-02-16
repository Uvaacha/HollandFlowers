package com.flowerapp.storage.handler;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UploadHandler {

    private final StorageService storageService;

    public Mono<ServerResponse> uploadProductImage(ServerRequest request) {
        log.info("=== UPLOAD HANDLER - Product Image ===");

        return request.multipartData()
                .flatMap(multipartData -> {
                    log.info("Multipart data received");

                    var filePart = (FilePart) multipartData.getFirst("file");

                    if (filePart == null) {
                        log.error("No file part found in request");
                        return ServerResponse.badRequest()
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(ApiResponse.error("No file provided"));
                    }

                    log.info("File received: {}, Type: {}", filePart.filename(), filePart.headers().getContentType());

                    return storageService.uploadProductImage(filePart)
                            .flatMap(url -> {
                                log.info("Upload successful: {}", url);
                                Map<String, String> response = new HashMap<>();
                                response.put("url", url);
                                response.put("fileName", filePart.filename());

                                return ServerResponse.ok()
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .bodyValue(ApiResponse.success("Image uploaded successfully", response));
                            })
                            .onErrorResume(error -> {
                                log.error("Upload failed:", error);
                                return ServerResponse.status(500)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .bodyValue(ApiResponse.error("Upload failed: " + error.getMessage()));
                            });
                });
    }

    public Mono<ServerResponse> uploadCategoryImage(ServerRequest request) {
        log.info("=== UPLOAD HANDLER - Category Image ===");

        return request.multipartData()
                .flatMap(multipartData -> {
                    var filePart = (FilePart) multipartData.getFirst("file");

                    if (filePart == null) {
                        return ServerResponse.badRequest()
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(ApiResponse.error("No file provided"));
                    }

                    return storageService.uploadCategoryImage(filePart)
                            .flatMap(url -> {
                                Map<String, String> response = new HashMap<>();
                                response.put("url", url);
                                response.put("fileName", filePart.filename());

                                return ServerResponse.ok()
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .bodyValue(ApiResponse.success("Image uploaded successfully", response));
                            })
                            .onErrorResume(error -> {
                                log.error("Upload failed:", error);
                                return ServerResponse.status(500)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .bodyValue(ApiResponse.error("Upload failed: " + error.getMessage()));
                            });
                });
    }
}