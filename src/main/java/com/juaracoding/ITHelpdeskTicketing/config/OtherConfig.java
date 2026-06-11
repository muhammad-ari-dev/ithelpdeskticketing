package com.juaracoding.ITHelpdeskTicketing.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:other.properties")
public class OtherConfig {
    private static String baseMailUrl;

    public static String getBaseMailUrl() {
        return baseMailUrl;
    }
    @Value("${base.mail.url}")
    private void setBaseMailUrl(String baseMailUrl) {
        this.baseMailUrl = baseMailUrl;
    }
}
