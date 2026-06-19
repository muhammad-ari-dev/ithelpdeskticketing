package com.juaracoding.ITHelpdeskTicketing.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:cloudinary.properties")
public class CloudinaryConfig {

    private static String cloudName;
    private static String apiKey;
    private static String apiSecret;

    // --- GETTER STATIC ---
    public static String getCloudName() { return cloudName; }
    public static String getApiKey() { return apiKey; }
    public static String getApiSecret() { return apiSecret; }

    // --- SETTER INJECTION ---
    @Value("${cloudinary.cloud-name}")
    private void setCloudName(String cloudName) {
        CloudinaryConfig.cloudName = cloudName;
    }

    @Value("${cloudinary.api-key}")
    private void setApiKey(String apiKey) {
        CloudinaryConfig.apiKey = apiKey;
    }

    @Value("${cloudinary.api-secret}")
    private void setApiSecret(String apiSecret) {
        CloudinaryConfig.apiSecret = apiSecret;
    }
}