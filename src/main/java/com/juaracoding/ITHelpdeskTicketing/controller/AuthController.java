package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.LoginDTO;
import com.juaracoding.ITHelpdeskTicketing.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * ENDPOINT LOGIN
     *
     * @Valid → Memicu semua anotasi validasi di LoginDTO (@NotBlank, @Pattern, @Size)
     *          sebelum method ini dijalankan.
     *
     * ALUR VALIDASI:
     *   1. Request masuk → Spring membaca @Valid
     *   2. Spring menjalankan semua validator di LoginDTO
     *   3a. Jika GAGAL → Spring langsung lempar MethodArgumentNotValidException
     *       → Ditangkap oleh GlobalExceptionHandler → Return 400 Bad Request
     *   3b. Jika BERHASIL → loginDTO diteruskan ke authService.login()
     *
     * Sebelumnya @Valid sudah ada di sini, tapi LoginDTO belum punya anotasi validasi.
     * Sekarang sudah lengkap.
     */
    @PostMapping("/login")
    public ResponseEntity<Object> login(
            @Valid @RequestBody LoginDTO loginDTO,
            HttpServletRequest request) {
        return authService.login(authService.mapToEntity(loginDTO), request);
    }
}
