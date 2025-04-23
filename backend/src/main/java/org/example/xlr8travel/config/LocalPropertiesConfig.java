package org.example.xlr8travel.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

/**
 * Configuration for loading local properties file if it exists
 * This allows developers to keep sensitive keys out of git
 */
@Configuration
@PropertySources({
    // First try to load application-local.properties (gitignored)
    @PropertySource(value = "classpath:application-local.properties", ignoreResourceNotFound = true),
    // Then fall back to application-dev.properties
    @PropertySource(value = "classpath:application-dev.properties", ignoreResourceNotFound = true)
})
public class LocalPropertiesConfig {

    private static final Logger log = LoggerFactory.getLogger(LocalPropertiesConfig.class);
    
    public LocalPropertiesConfig() {
        Resource localPropertiesResource = new ClassPathResource("application-local.properties");
        if (localPropertiesResource.exists()) {
            log.info("Loaded application-local.properties");
        } else {
            log.info("application-local.properties not found, using default properties");
        }
    }
}