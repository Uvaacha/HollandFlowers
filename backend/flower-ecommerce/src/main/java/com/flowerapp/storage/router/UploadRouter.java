package com.flowerapp.storage.router;

import com.flowerapp.storage.handler.UploadHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RouterFunctions.route;
import static org.springframework.web.reactive.function.server.RequestPredicates.POST;

@Configuration
public class UploadRouter {

    @Bean
    public RouterFunction<ServerResponse> uploadRoutes(UploadHandler handler) {
        return route(POST("/admin/upload/product-image"), handler::uploadProductImage)
                .andRoute(POST("/admin/upload/category-image"), handler::uploadCategoryImage);
    }
}