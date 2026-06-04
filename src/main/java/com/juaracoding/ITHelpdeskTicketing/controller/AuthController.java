package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.*;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepository;
import com.juaracoding.ITHelpdeskTicketing.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // <== TAMBAHKAN INI BIAR FRONTEND BISA MASUK
public class AuthController {

    private final AuthService authService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody EmployeeRequest request) {
        String result = authService.createUser(request, "SUPER_ADMIN");
        if (result.contains("berhasil")) return ResponseEntity.ok(result);
        return ResponseEntity.badRequest().body(result);
    }

    // ENDPOINT BARU: Dipanggil saat user klik link dari email dan submit password baru
    @PostMapping("/set-password")
    public ResponseEntity<String> setPasswordViaMagicLink(@RequestParam String token, @RequestParam String newPassword) {
        try {
            String result = authService.setPasswordViaMagicLink(token, newPassword);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        try {
            String result = authService.login(request);
            if (result.contains("sukses")) {
                return ResponseEntity.ok(result); // Status 200 OK
            }
            return ResponseEntity.badRequest().body(result); // Status 400 Bad Request
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/leaders")
    public List<Employee> getLeaders() {
        // Harus "LEAD" (Kapital) sesuai isi tabel MstRole lu
        return employeeRepository.findByRoleRoleName("LEAD");
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String result = authService.requestOtp(request.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset_password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            String result = authService.resetPassword(request);
            if (result.contains("berhasil")) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}