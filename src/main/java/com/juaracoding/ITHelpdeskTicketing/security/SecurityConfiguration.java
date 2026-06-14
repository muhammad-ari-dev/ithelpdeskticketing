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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

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
        authProvider.setUserDetailsService(authService);
        return authProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://103.164.191.212:3000",
            "http://103.164.191.212:8090",
            "http://103.164.191.212"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * SECURITY FILTER CHAIN
     *
     * Menentukan endpoint mana yang:
     *   - BEBAS diakses tanpa login (permitAll)
     *   - WAJIB login dulu (authenticated)
     *
     * PENJELASAN TIAP ENDPOINT:
     *
     * ✅ PERMIT ALL (tidak butuh token):
     *   /api/auth/**          → login (tidak mungkin punya token sebelum login)
     *   /api/employee/set-password  → employee set password via magic link
     *                                 (belum punya token karena belum pernah login)
     *   /api/employee/leads   → dropdown lead saat register
     *                           (admin yang register tidak selalu punya token baru)
     *   /swagger-ui/**        → dokumentasi API
     *   /v3/api-docs/**       → dokumentasi API
     *
     * 🔒 AUTHENTICATED (wajib bawa JWT token):
     *   /api/employee/register        → hanya admin yang bisa register employee
     *   /api/employee/disable         → hanya admin yang bisa disable akun
     *   /api/employee/reset-password  → hanya admin yang bisa reset password orang lain
     *   /api/employee/change-password → employee yang sedang login ganti password sendiri
     *   Semua endpoint lain           → anyRequest().authenticated()
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter filter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(request -> request
                .requestMatchers(
                    // Endpoint bebas tanpa token
                    "/api/test/running",
                    "/api/auth/**",
                    "/api/employee/set-password",  // set password via magic link (belum punya token)
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                // Semua endpoint lain wajib bawa JWT token
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
