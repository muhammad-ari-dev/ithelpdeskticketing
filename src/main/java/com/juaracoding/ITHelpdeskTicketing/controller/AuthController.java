package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.LoginDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.LoginResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

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

    /**
     * ENDPOINT REGISTER
     *
     * PERUBAHAN: Ditambahkan @Valid di parameter @RequestBody.
     *
     * Sebelumnya tidak ada @Valid, sehingga validasi di RegisDTO
     * (seperti @Pattern, @Email, @NotBlank) TIDAK pernah dijalankan
     * meskipun sudah ditulis.
     *
     * Dengan @Valid:
     *   → Format email, nomor HP, username, nama, dan role
     *     akan divalidasi otomatis sebelum masuk ke authService.registerEmployee()
     *
     * PERUBAHAN LAIN: Error handling dipindah ke GlobalExceptionHandler,
     * tapi try-catch ini tetap untuk error bisnis logic dari service
     * (misal: "Username sudah dipakai!").
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(
            @Valid @RequestBody RegisDTO regisDTO) {
        try {
            String result = authService.registerEmployee(regisDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ENDPOINT SET PASSWORD
     *
     * PERUBAHAN: Ditambahkan @Valid di parameter @RequestBody.
     *
     * Sebelumnya tidak ada @Valid, sehingga validasi kekuatan password
     * (regex di SetPasswordDTO) tidak pernah berjalan.
     *
     * Dengan @Valid:
     *   → magicToken akan dicek format UUID-nya
     *   → newPassword & confirmPassword akan dicek kekuatannya
     *      (minimal 8 karakter, huruf besar, huruf kecil, angka, simbol)
     *   → Cek kesamaan newPassword == confirmPassword tetap di service
     */
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(
            @Valid @RequestBody SetPasswordDTO dto) {
        try {
            String result = authService.setPassword(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/leads")
    public ResponseEntity<?> getLeads() {
        try {
            return ResponseEntity.ok(authService.getAllLeads());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
