package com.flowerapp.hebasePayment.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Collections;

@Configuration
public class RestTemplateConfig {

    private final HesabeConfig hesabeConfig;

    public RestTemplateConfig(HesabeConfig hesabeConfig) {
        this.hesabeConfig = hesabeConfig;
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(hesabeConfig.getConnectionTimeout()))
                .setReadTimeout(Duration.ofMillis(hesabeConfig.getReadTimeout()))
                .interceptors(Collections.singletonList(loggingInterceptor()))
                .build();
    }

    private ClientHttpRequestInterceptor loggingInterceptor() {
        return (request, body, execution) -> {
            // Log request details (optional)
            // Be careful not to log sensitive data in production
            return execution.execute(request, body);
        };
    }
}
