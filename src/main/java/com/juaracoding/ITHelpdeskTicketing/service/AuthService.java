package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.dto.EmployeeRequest;
import com.juaracoding.ITHelpdeskTicketing.dto.LoginRequest;
import com.juaracoding.ITHelpdeskTicketing.dto.ResetPasswordRequest;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepository;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService; // <== INI TAMBAHANNYA CUY: Manggil Tukang Pos

    @Transactional
    public String createUser(EmployeeRequest request, String adminName) {
        if (employeeRepository.existsByUserName(request.getUserName())) return "Username sudah digunakan!";
        if (employeeRepository.existsByEmail(request.getEmail())) return "Email sudah terdaftar!";

        // Ambil Role (pake Kapital sesuai DB lu)
        String targetRole = request.getRoleName().toUpperCase().trim();
        Role role = roleRepository.findByRoleName(targetRole)
                .orElseThrow(() -> new RuntimeException("Role '" + targetRole + "' tidak ditemukan!"));

        Employee employee = new Employee();
        employee.setEmployeeName(request.getEmployeeName());
        employee.setUserName(request.getUserName());
        employee.setEmail(request.getEmail());
        employee.setNoHp(request.getNoHp());
        employee.setRole(role);

        // --- INI SOLUSINYA CUY: Isi CreatedBy manual ---
        employee.setCreatedBy("ADMIN_SYSTEM"); // Atau pake adminName dari parameter
        employee.setCreatedAt(LocalDateTime.now());
        // -----------------------------------------------

        employee.setPassword("LOCKED");
        employee.setAccountStatus("PENDING_PASSWORD");

        if (request.getLeadId() != null) {
            employeeRepository.findById(request.getLeadId()).ifPresent(employee::setLead);
        }

        String token = UUID.randomUUID().toString();
        employee.setMagicToken(token);
        employee.setMagicTokenExpiryAt(LocalDateTime.now().plusHours(24));

        employeeRepository.save(employee); // SEKARANG GAK BAKAL EROR LAGI

        try {
            emailService.sendMagicLink(employee.getEmail(), employee.getEmployeeName(), token);
        } catch (Exception e) {
            throw new RuntimeException("Gagal kirim email: " + e.getMessage());
        }

        return "Karyawan berhasil didaftarkan!";
    }
    @Transactional
    public String setPasswordViaMagicLink(String token, String newPassword) {
        // 4: Cari token di database
        Employee employee = employeeRepository.findByMagicToken(token)
                .orElseThrow(() -> new RuntimeException("Link tidak valid atau sudah pernah digunakan!"));

        // 5: Cek apakah token sudah kedaluwarsa
        if (employee.getMagicTokenExpiryAt().isBefore(LocalDateTime.now())) {
            return "Gagal! Magic link sudah kedaluwarsa (lebih dari 24 jam).";
        }

        // 6: Update password baru & ubah status jadi ACTIVE
        employee.setPassword(newPassword); // Nanti di-hash pake BCrypt
        employee.setAccountStatus("ACTIVE");

        // 7: Hapus token agar tidak bisa dipakai lagi (Keamanan Utama!)
        employee.setMagicToken(null);
        employee.setMagicTokenExpiryAt(null);
        employee.setUpdatedBy(employee.getEmployeeName());

        employeeRepository.save(employee);
        return "Password berhasil dibuat! Akun Anda sekarang berstatus ACTIVE.";
    }

    public String login(LoginRequest request) {
        // 1. Cari user berdasarkan username
        Employee employee = employeeRepository.findByUserName(request.getUserName())
                .orElseThrow(() -> new RuntimeException("Gagal! Username tidak ditemukan."));

        // 2. Cek apakah status akunnya ACTIVE
        if (!employee.getAccountStatus().equals("ACTIVE")) {
            return "Gagal login! Akun Anda saat ini berstatus: " + employee.getAccountStatus();
        }

        // 3. Cek Password (Sementara pakai pencocokan teks biasa karena belum di-hash)
        if (!employee.getPassword().equals(request.getPassword())) {
            return "Gagal! Password yang Anda masukkan salah.";
        }

        // 4. Kalau semua aman, kembalikan pesan sukses beserta Role-nya
        return "Login sukses! Selamat datang, " + employee.getEmployeeName() + " (" + employee.getRole().getRoleName() + ")";
    }

    // --- FITUR LUPA PASSWORD: REQUEST OTP ---
    public String requestOtp(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Gagal! Email tidak terdaftar di sistem."));

        // Generate 6 digit angka random
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        // Simpan OTP dan set masa berlaku (misal: 10 menit)
        employee.setOtpCode(otp);
        employee.setOtpExpiryAt(LocalDateTime.now().plusMinutes(10));
        employeeRepository.save(employee);

        // KIRIM EMAIL OTP ASLI
        try {
            emailService.sendOtpEmail(employee.getEmail(), otp);
            System.out.println("BERHASIL: Email OTP terkirim ke " + employee.getEmail());
        } catch (Exception e) {
            System.out.println("GAGAL: Error saat ngirim email OTP - " + e.getMessage());
            throw new RuntimeException("Gagal mengirim email OTP ke " + employee.getEmail());
        }

        return "Kode OTP telah dikirim ke email Anda.";
    }

    // --- FITUR LUPA PASSWORD: RESET PASSWORD ---
    public String resetPassword(ResetPasswordRequest request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Gagal! Email tidak terdaftar."));

        // Cek apakah OTP cocok
        if (employee.getOtpCode() == null || !employee.getOtpCode().equals(request.getOtpCode())) {
            return "Gagal! Kode OTP salah atau tidak valid.";
        }

        // Cek apakah OTP sudah kedaluwarsa
        if (employee.getOtpExpiryAt().isBefore(LocalDateTime.now())) {
            return "Gagal! Kode OTP sudah kedaluwarsa. Silakan minta kode baru.";
        }

        // Kalau aman, update password dan bersihkan sisa OTP di database
        employee.setPassword(request.getNewPassword());
        employee.setOtpCode(null);
        employee.setOtpExpiryAt(null);
        employeeRepository.save(employee);

        return "Password berhasil diubah! Silakan login dengan password baru Anda.";
    }
}