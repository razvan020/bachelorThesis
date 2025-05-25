package org.example.xlr8travel.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // *** COMMENT OUT or REMOVE this section ***
        // Let Spring Security handle CORS via the CorsConfigurationSource bean
        /*
        registry.addMapping("/api/**") // Target your API endpoints
                .allowedOrigins("http://localhost:3000") // Your React app's origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true); // Important for sessions/tokens
        */
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Explicitly define static resource locations to avoid conflicts with API endpoints
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        // Removed the problematic configuration that was treating API requests as static resources
    }

    // Keep other WebMvcConfigurer methods if you have them
}
