package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

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
            String result = employeeService.registerEmployee(regisDTO);
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
            String result = employeeService.setPassword(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/leads")
    public ResponseEntity<?> getLeads() {
        try {
            return ResponseEntity.ok(employeeService.getAllLeads());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
