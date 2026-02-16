package com.flowerapp.storage.service;

import com.flowerapp.common.exception.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseServiceKey;

    @Value("${supabase.storage-bucket}")
    private String storageBucket;

    private final WebClient webClient;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public StorageService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Upload a product image to Supabase Storage
     */
    public Mono<String> uploadProductImage(FilePart file) {
        return validateFile(file)
                .flatMap(valid -> {
                    String fileName = generateFileName(file.filename(), "products");
                    return uploadFile(file, fileName);
                });
    }

    /**
     * Upload a category image to Supabase Storage
     */
    public Mono<String> uploadCategoryImage(FilePart file) {
        return validateFile(file)
                .flatMap(valid -> {
                    String fileName = generateFileName(file.filename(), "categories");
                    return uploadFile(file, fileName);
                });
    }

    /**
     * Upload a user profile image to Supabase Storage
     */
    public Mono<String> uploadProfileImage(FilePart file, UUID userId) {
        return validateFile(file)
                .flatMap(valid -> {
                    String fileName = generateFileName(file.filename(), "profiles/" + userId);
                    return uploadFile(file, fileName);
                });
    }

    /**
     * Upload file to Supabase Storage
     */
    private Mono<String> uploadFile(FilePart file, String fileName) {
        String contentType = file.headers().getContentType() != null
                ? file.headers().getContentType().toString()
                : "application/octet-stream";

        return DataBufferUtils.join(file.content())
                .flatMap(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);

                    String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                            supabaseUrl, storageBucket, fileName);

                    log.info("=== SUPABASE UPLOAD DEBUG ===");
                    log.info("Upload URL: {}", uploadUrl);
                    log.info("Bucket: {}", storageBucket);
                    log.info("FileName: {}", fileName);
                    log.info("Content-Type: {}", contentType);
                    log.info("File size: {} bytes", bytes.length);

                    return webClient.post()
                            .uri(uploadUrl)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseServiceKey)
                            .header("Content-Type", contentType)
                            .header("x-upsert", "true")
                            .bodyValue(bytes)
                            .retrieve()
                            .onStatus(
                                    status -> status.is4xxClientError(),
                                    response -> response.bodyToMono(String.class)
                                            .flatMap(body -> {
                                                log.error("Supabase 4xx error: {}", body);
                                                return Mono.error(new RuntimeException("Supabase error: " + body));
                                            })
                            )
                            .onStatus(
                                    status -> status.is5xxServerError(),
                                    response -> response.bodyToMono(String.class)
                                            .flatMap(body -> {
                                                log.error("Supabase 5xx error: {}", body);
                                                return Mono.error(new RuntimeException("Supabase server error: " + body));
                                            })
                            )
                            .bodyToMono(String.class)
                            .map(response -> {
                                log.info("Supabase response: {}", response);
                                return getPublicUrl(fileName);
                            })
                            .doOnSuccess(url -> log.info("File uploaded successfully: {}", url))
                            .onErrorMap(e -> {
                                log.error("Failed to upload file: {}", e.getMessage(), e);
                                return CustomException.internalError("Failed to upload file: " + e.getMessage());
                            });
                });
    }

    /**
     * Delete a file from Supabase Storage
     */
    public Mono<Boolean> deleteFile(String fileUrl) {
        try {
            String fileName = extractFileNameFromUrl(fileUrl);
            String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
                    supabaseUrl, storageBucket, fileName);

            return webClient.delete()
                    .uri(deleteUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseServiceKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(response -> true)
                    .doOnSuccess(success -> log.info("File deleted successfully: {}", fileName))
                    .onErrorResume(e -> {
                        log.error("Failed to delete file: {}", e.getMessage());
                        return Mono.just(false);
                    });
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
            return Mono.just(false);
        }
    }

    /**
     * Get public URL for a file
     */
    public String getPublicUrl(String fileName) {
        return String.format("%s/storage/v1/object/public/%s/%s",
                supabaseUrl, storageBucket, fileName);
    }

    /**
     * Validate uploaded file
     */
    private Mono<Boolean> validateFile(FilePart file) {
        MediaType contentType = file.headers().getContentType();

        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toString())) {
            return Mono.error(CustomException.badRequest(
                    "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP"));
        }

        return file.content()
                .map(DataBuffer::readableByteCount)
                .reduce(0L, Long::sum)
                .flatMap(size -> {
                    if (size > MAX_FILE_SIZE) {
                        return Mono.error(CustomException.badRequest(
                                "File size exceeds maximum allowed size of 10MB"));
                    }
                    return Mono.just(true);
                });
    }

    /**
     * Generate unique file name
     */
    private String generateFileName(String originalFileName, String folder) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return String.format("%s/%s%s", folder, UUID.randomUUID(), extension);
    }

    /**
     * Extract file name from public URL
     */
    private String extractFileNameFromUrl(String url) {
        String prefix = String.format("%s/storage/v1/object/public/%s/", supabaseUrl, storageBucket);
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }
        throw CustomException.badRequest("Invalid file URL");
    }

    /**
     * Upload file synchronously (blocking)
     */
    public String uploadProductImageSync(FilePart file) {
        return uploadProductImage(file).block();
    }

    /**
     * Upload file synchronously (blocking)
     */
    public String uploadCategoryImageSync(FilePart file) {
        return uploadCategoryImage(file).block();
    }

    /**
     * Upload file synchronously (blocking)
     */
    public String uploadProfileImageSync(FilePart file, UUID userId) {
        return uploadProfileImage(file, userId).block();
    }

    /**
     * Delete file synchronously (blocking)
     */
    public boolean deleteFileSync(String fileUrl) {
        Boolean result = deleteFile(fileUrl).block();
        return result != null && result;
    }
}