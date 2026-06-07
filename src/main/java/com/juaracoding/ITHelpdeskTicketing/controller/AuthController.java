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
@CrossOrigin(origins = "*") // <== PENTING BANGET: Biar React lu nggak kena eror CORS (diblokir)
public class AuthController {

    private final AuthService authService;

    // ==========================================
    // FOKUS 1: GERBANG LOGIN
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginDTO loginDTO,
                                        HttpServletRequest request) {
        return authService.login(authService.mapToEntity(loginDTO), request);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(@RequestBody RegisDTO regisDTO) {
        try {
            String result = authService.registerEmployee(regisDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestBody SetPasswordDTO dto) {
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