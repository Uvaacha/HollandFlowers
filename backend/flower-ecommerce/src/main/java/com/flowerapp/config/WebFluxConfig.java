package com.flowerapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.http.codec.multipart.DefaultPartHttpMessageReader;
import org.springframework.http.codec.multipart.MultipartHttpMessageReader;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
public class WebFluxConfig implements WebFluxConfigurer {

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        DefaultPartHttpMessageReader partReader = new DefaultPartHttpMessageReader();

        // Set max in-memory size for parts (10MB)
        partReader.setMaxInMemorySize(10 * 1024 * 1024);

        // Create multipart reader with the configured part reader
        MultipartHttpMessageReader multipartReader = new MultipartHttpMessageReader(partReader);

        // Register the multipart reader
        configurer.defaultCodecs().multipartReader(multipartReader);

        // Also set max in-memory size for default codecs
        configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024);
    }
}