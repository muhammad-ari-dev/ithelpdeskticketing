package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.validation.ChangePasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.EditEmployeeDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.UpdateEmployeeDTO;
import com.juaracoding.ITHelpdeskTicketing.service.EmployeeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

    @GetMapping("/employees")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> getEmployees(
            HttpServletRequest request
    ){
        return employeeService.getEmployees(request);
    }

    @GetMapping("/profile")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> profile(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request){
        return employeeService.getProfile(userDetails.getUsername(), request);
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
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordDTO changePasswordDTO,
            HttpServletRequest request
    ) {
        return employeeService.changePassword(userDetails.getUsername(), changePasswordDTO, request);
    }

    @GetMapping("/leads")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> getLeads(
            HttpServletRequest request
    ) {
        return employeeService.getAllLeads(request);
    }

    // =========================================================
    // ENDPOINT YANG SUDAH ADA (tidak diubah)
    // =========================================================

    @PostMapping("/register")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> registerEmployee(
            @Valid @RequestBody RegisDTO regisDTO,
            HttpServletRequest request){
            return employeeService.registerEmployee(regisDTO, request);
    }

    @PatchMapping("/edit-employee")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> editEmployee(
            @Valid @RequestBody UpdateEmployeeDTO updateEmployeeDTO,
            HttpServletRequest request){
        return employeeService.editEmployee(updateEmployeeDTO, request);
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
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> disableUser(
            @Valid @RequestBody EditEmployeeDTO disableUserDTO,
            HttpServletRequest request) {
            return employeeService.disableUser(disableUserDTO, request);
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
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> resetPassUser(
            @Valid @RequestBody EditEmployeeDTO resetPasswordDTO,
            HttpServletRequest request) {
        return employeeService.resetPassUser(resetPasswordDTO, request);
    }
}
