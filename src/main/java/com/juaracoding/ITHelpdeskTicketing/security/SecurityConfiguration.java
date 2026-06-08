package com.juaracoding.ITHelpdeskTicketing.security;

import com.juaracoding.ITHelpdeskTicketing.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private AuthService authService;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(authService);// penulisan di springboot versi 3
        return authProvider;
    }

    /*
        401 -> Otentikasi
        403 -> Forbiden / Otorisasi
     */

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter filter) throws Exception {
        http.
            csrf(AbstractHttpConfigurer::disable).
            authorizeHttpRequests(request->request.requestMatchers(
                    "/api/test/running"
                    ,"/api/auth/**"
                ,"/swagger-ui/**"
                ,"/v3/api-docs/**"
            ).permitAll().anyRequest().authenticated()).
            authenticationProvider(authenticationProvider()).
            sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).
            addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}