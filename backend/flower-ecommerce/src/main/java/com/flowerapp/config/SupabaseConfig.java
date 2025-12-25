package com.flowerapp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Data
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseConfig {

    private String url;
    private String key;
    private String serviceKey;
    private Storage storage = new Storage();

    @Data
    public static class Storage {
        private String bucket;
    }

    @Bean
    public WebClient supabaseStorageClient() {
        return WebClient.builder()
                .baseUrl(url + "/storage/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .defaultHeader("apikey", key)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(50 * 1024 * 1024)) // 50MB max
                .build();
    }

    @Bean
    public WebClient supabaseClient() {
        return WebClient.builder()
                .baseUrl(url + "/rest/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .defaultHeader("apikey", key)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String getPublicUrl(String filePath) {
        return url + "/storage/v1/object/public/" + storage.getBucket() + "/" + filePath;
    }
}
