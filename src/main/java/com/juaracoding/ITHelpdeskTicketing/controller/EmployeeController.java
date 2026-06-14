package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.validation.ChangePasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.DisableUserDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/profile")
    public ResponseEntity<Object> profile(@AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request){
        return employeeService.getProfile(userDetails.getUsername(), request);
    }

    // =========================================================
    // ENDPOINT YANG SUDAH ADA (tidak diubah)
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody RegisDTO regisDTO) {
        try {
            String result = employeeService.registerEmployee(regisDTO);
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

    // =========================================================
    // ENDPOINT BARU — TASK ARI
    // =========================================================

    /**
     * DISABLE USER — Admin nonaktifkan akun employee/lead
     *
     * Method: PATCH (bukan POST/DELETE)
     *
     * MENGAPA PATCH?
     * → PATCH dipakai untuk update sebagian data (partial update).
     *   Kita hanya update field accountStatus, bukan semua data employee.
     *   Ini lebih semantik/bermakna dibanding POST.
     *
     * Endpoint: PATCH /api/employee/disable
     * Butuh: JWT Token (endpoint ini protected, hanya admin yang boleh)
     * Body: { "employeeId": "uuid-employee" }
     *
     * Flow:
     *   Admin klik disable di UI
     *   → Frontend kirim PATCH request dengan employeeId
     *   → Backend ubah accountStatus → INACTIVE
     *   → Employee tidak bisa login lagi
     */
    @PatchMapping("/disable")
    public ResponseEntity<?> disableUser(@Valid @RequestBody DisableUserDTO dto) {
        try {
            String result = employeeService.disableUser(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * RESET PASSWORD USER — Admin reset password employee/lead yang lupa password
     *
     * Method: PATCH
     * Endpoint: PATCH /api/employee/reset-password
     * Butuh: JWT Token (hanya admin yang boleh)
     * Body: { "employeeId": "uuid-employee" }
     *
     * MENGAPA PAKAI DisableUserDTO YANG SAMA?
     * → Karena reset password juga hanya butuh employeeId.
     *   Tidak perlu buat DTO baru yang isinya persis sama.
     *   Ini prinsip DRY (Don't Repeat Yourself).
     *
     * Flow:
     *   Admin klik reset password di UI
     *   → Frontend kirim PATCH request dengan employeeId
     *   → Backend generate magic token baru
     *   → Status employee → PENDING (tidak bisa login sampai set password baru)
     *   → Kirim magic link ke email employee
     *   → Employee klik link → hit endpoint /set-password
     *   → Status kembali ACTIVE
     */
    @PatchMapping("/reset-password")
    public ResponseEntity<?> resetPassUser(@Valid @RequestBody DisableUserDTO dto) {
        try {
            String result = employeeService.resetPassUser(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * CHANGE PASSWORD — Employee/Lead ganti password sendiri
     *
     * Method: PATCH
     * Endpoint: PATCH /api/employee/change-password
     * Butuh: JWT Token (employee yang sedang login)
     * Body: { "oldPassword": "...", "newPassword": "...", "confirmPassword": "..." }
     *
     * PERBEDAAN DENGAN RESET PASSWORD:
     *   resetPassUser → dilakukan ADMIN untuk orang lain, tidak perlu password lama
     *   changePassword → dilakukan DIRI SENDIRI, wajib verifikasi password lama dulu
     *
     * KEAMANAN:
     *   Username TIDAK diambil dari request body, tapi dari JWT token.
     *   Sehingga tidak mungkin employee A bisa ganti password employee B.
     *
     * Flow:
     *   Employee login → buka halaman ganti password
     *   → Input password lama + password baru + konfirmasi
     *   → Frontend kirim PATCH request (dengan JWT token di header)
     *   → Backend verifikasi password lama dulu
     *   → Jika benar → hash password baru → simpan
     */
    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordDTO dto) {
        try {
            String result = employeeService.changePassword(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
