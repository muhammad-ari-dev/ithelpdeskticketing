package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.dto.ChangePasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.DisableUserDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.LeadResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepo;
import com.juaracoding.ITHelpdeskTicketing.security.BcryptImpl;
import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private EmailService emailService;

    // =========================================================
    // FITUR 1: REGISTRASI EMPLOYEE (oleh Admin)
    // =========================================================
    @Transactional
    public String registerEmployee(RegisDTO dto) {
        if (employeeRepo.existsByUserName(dto.getUserName())) {
            return "Error: Username sudah dipakai!";
        }
        if (employeeRepo.existsByEmail(dto.getEmail())) {
            return "Error: Email sudah terdaftar!";
        }

        Employee employee = new Employee();
        employee.setEmployeeName(dto.getEmployeeName());
        employee.setUserName(dto.getUserName());
        employee.setEmail(dto.getEmail());
        employee.setNoHp(dto.getNoHp());
        employee.setPassword(BcryptImpl.hash(dto.getUserName() + "DEFAULT_PASSWORD_TEMP"));
        employee.setCreatedBy("ADMIN");

        Role role = roleRepo.findByRoleName(dto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Error: Role '" + dto.getRoleName() + "' tidak ditemukan!"));
        employee.setRole(role);

        if ("LEAD".equalsIgnoreCase(role.getRoleName()) ||
                "ADMINISTRATOR".equalsIgnoreCase(role.getRoleName())) {
            employee.setLead(null);
        } else {
            if (dto.getLeadID() == null || dto.getLeadID().isEmpty()) {
                throw new RuntimeException("Error: Staff wajib memiliki Lead!");
            }
            UUID leadUuid = UUID.fromString(dto.getLeadID());
            Employee atasan = employeeRepo.findById(leadUuid)
                    .orElseThrow(() -> new RuntimeException("Error: ID Lead tidak ditemukan!"));
            employee.setLead(atasan);
        }

        employee.setAccountStatus("PENDING");

        String magicToken = UUID.randomUUID().toString();
        employee.setMagicToken(magicToken);

        employeeRepo.save(employee);
        emailService.sendMagicLink(employee.getEmail(), magicToken);

        return "Sukses: Employee berhasil didaftarkan! Email setup password sudah dikirim ke " + employee.getEmail();
    }

    // =========================================================
    // FITUR 2: SET PASSWORD (oleh Employee via Magic Link)
    // =========================================================
    @Transactional
    public String setPassword(SetPasswordDTO dto) {
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Password baru dan konfirmasi tidak cocok!");
        }

        Employee employee = employeeRepo.findByMagicToken(dto.getMagicToken())
                .orElseThrow(() -> new RuntimeException("Token tidak valid atau sudah kedaluwarsa!"));

        employee.setPassword(BcryptImpl.hash(employee.getUserName() + dto.getNewPassword()));
        employee.setAccountStatus("ACTIVE");
        employee.setMagicToken(null);
        employeeRepo.save(employee);

        return "Password berhasil diset! Akun sekarang sudah aktif. Silakan login.";
    }

    // =========================================================
    // FITUR 3: GET ALL LEADS
    // =========================================================
    public List<LeadResponseDTO> getAllLeads() {
        return employeeRepo.findByRole_RoleNameIgnoreCase("LEAD")
                .stream()
                .map(LeadResponseDTO::new)
                .collect(Collectors.toList());
    }

    // =========================================================
    // FITUR 4: DISABLE USER (oleh Admin)
    // =========================================================

    /**
     * Admin menonaktifkan akun employee/lead.
     *
     * ALUR:
     *   1. Cari employee berdasarkan ID
     *   2. Cek apakah akun sudah INACTIVE (tidak perlu proses lagi)
     *   3. Ubah status dari ACTIVE → INACTIVE
     *   4. Simpan
     *
     * MENGAPA STATUS "INACTIVE" BUKAN DIHAPUS?
     * → Soft delete — data tetap ada di DB untuk keperluan audit/history.
     *   Kalau dihapus, riwayat tiket yang dibuat employee tersebut bisa ikut hilang.
     *
     * EFEKNYA:
     *   → Saat employee ini coba login, AuthService cek accountStatus == "ACTIVE"
     *   → Karena INACTIVE, login akan ditolak dengan pesan "Akun Belum Aktif"
     *
     * @Transactional → Rollback otomatis jika ada error saat simpan
     */
    @Transactional
    public String disableUser(DisableUserDTO dto) {

        // Parse String UUID → tipe UUID
        // Aman karena sudah divalidasi @Pattern di DTO sebelum sampai sini
        UUID employeeId = UUID.fromString(dto.getEmployeeId());

        // Cari employee di DB berdasarkan ID
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(ConstantMessage.USER_NOT_FOUND));

        // Cek apakah akun sudah tidak aktif — tidak perlu proses dua kali
        if ("INACTIVE".equals(employee.getAccountStatus())) {
            return ConstantMessage.ALREADY_INACTIVE;
        }

        // Ubah status → INACTIVE
        employee.setAccountStatus("INACTIVE");
        employee.setUpdatedBy("ADMIN");
        employeeRepo.save(employee);

        return ConstantMessage.SUCCESS_DISABLE_USER + ": " + employee.getEmployeeName();
    }



    // =========================================================
    // FITUR 5: RESET PASSWORD USER (oleh Admin)
    // =========================================================

    /**
     * Admin mereset password employee/lead yang lupa password.
     *
     * ALUR:
     *   1. Cari employee berdasarkan ID
     *   2. Generate magic token baru (UUID)
     *   3. Simpan magic token ke DB
     *   4. Ubah status ke PENDING (tidak bisa login sampai set password baru)
     *   5. Kirim magic link ke email employee
     *
     * MENGAPA STATUS DIUBAH KE PENDING?
     * → Keamanan! Selama employee belum set password baru via magic link,
     *   mereka tidak bisa login. Ini mencegah akun yang passwordnya di-reset
     *   tetap bisa diakses dengan password lama.
     *
     * FLOW SELANJUTNYA (setelah method ini):
     *   Employee klik link di email
     *   → Frontend buka halaman set-password
     *   → Employee input password baru + konfirmasi
     *   → Hit endpoint POST /api/employee/set-password
     *   → Status kembali ACTIVE, magic token dihapus
     *
     * @Transactional → Rollback otomatis jika gagal kirim email
     */
    @Transactional
    public String resetPassUser(DisableUserDTO dto) {
        // Pakai DisableUserDTO yang sama karena sama-sama hanya butuh employeeId
        // Tidak perlu buat DTO baru yang isinya sama persis

        UUID employeeId = UUID.fromString(dto.getEmployeeId());

        // Cari employee di DB
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(ConstantMessage.USER_NOT_FOUND));

        /**
         * Generate magic token baru
         *
         * UUID.randomUUID() → string unik 36 karakter
         * Token lama (jika ada) akan ditimpa dengan yang baru.
         * Jadi link email lama otomatis tidak berlaku lagi.
         */
        String magicToken = UUID.randomUUID().toString();
        employee.setMagicToken(magicToken);

        /**
         * Ubah status ke PENDING
         *
         * MENGAPA? Agar employee tidak bisa login dengan password lama
         * selama proses reset belum selesai.
         * Status akan kembali ACTIVE setelah employee set password baru
         * via endpoint /set-password.
         */
        employee.setAccountStatus("PENDING");
        employee.setUpdatedBy("ADMIN");
        employeeRepo.save(employee);

        // Kirim email magic link ke employee
        // Pakai method yang sama dengan saat register
        emailService.sendMagicLink(employee.getEmail(), magicToken);

        return ConstantMessage.SUCCESS_RESET_PASS + ": " + employee.getEmail();
    }

    // =========================================================
    // FITUR 6: CHANGE PASSWORD (oleh Employee sendiri)
    // =========================================================

    /**
     * Employee/Lead mengganti password mereka sendiri.
     *
     * ALUR:
     *   1. Ambil username dari JWT token (SecurityContext)
     *   2. Cari employee di DB berdasarkan username
     *   3. Verifikasi password lama
     *   4. Cek password baru != password lama
     *   5. Cek newPassword == confirmPassword
     *   6. Hash password baru dan simpan
     *
     * MENGAPA AMBIL USERNAME DARI TOKEN, BUKAN DARI REQUEST BODY?
     * → Lebih aman! Employee tidak bisa ganti password orang lain
     *   dengan mengirim username orang lain di request body.
     *   Username diambil dari JWT token yang sudah diverifikasi
     *   oleh JwtFilter — dijamin adalah pemilik akun yang sedang login.
     *
     * @Transactional → Rollback otomatis jika ada error saat simpan
     */
    @Transactional
    public String changePassword(ChangePasswordDTO dto) {

        /**
         * Ambil username dari SecurityContext
         *
         * SecurityContext adalah "tempat penyimpanan sementara" yang diisi
         * oleh JwtFilter setiap kali ada request dengan token valid.
         *
         * Analoginya: seperti kartu tanda masuk yang kamu tunjukkan ke satpam,
         * satpam (JwtFilter) sudah verifikasi dan catat nama kamu,
         * sekarang kita tinggal ambil catatan nama tersebut.
         */
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName(); // ambil username dari token JWT yang sudah diverifikasi

        // Cari employee di DB berdasarkan username dari token
        Employee employee = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException(ConstantMessage.USER_NOT_FOUND));

        /**
         * Verifikasi password lama
         *
         * POLA: BcryptImpl.verifyHash(userName + oldPassword, hashedPassword)
         * HARUS KONSISTEN dengan cara password di-hash saat setPassword()
         */
        if (!BcryptImpl.verifyHash(employee.getUserName() + dto.getOldPassword(), employee.getPassword())) {
            throw new RuntimeException(ConstantMessage.OLD_PASSWORD_WRONG);
        }

        /**
         * Cek password baru tidak sama dengan password lama
         *
         * MENGAPA PERLU DICEK?
         * Tidak ada gunanya "ganti" password kalau isinya sama.
         * Ini juga best practice keamanan — memaksa user benar-benar
         * menggunakan password yang berbeda.
         *
         * Cara cek: verifikasi apakah newPassword cocok dengan hash yang ada.
         * Jika cocok berarti sama dengan password lama → tolak.
         */
        if (BcryptImpl.verifyHash(employee.getUserName() + dto.getNewPassword(), employee.getPassword())) {
            throw new RuntimeException(ConstantMessage.SAME_PASSWORD);
        }

        // Cek newPassword == confirmPassword
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Password baru dan konfirmasi tidak cocok!");
        }

        // Hash password baru dan simpan
        employee.setPassword(BcryptImpl.hash(employee.getUserName() + dto.getNewPassword()));
        employee.setUpdatedBy(username);
        employeeRepo.save(employee);

        return ConstantMessage.SUCCESS_CHANGE_PASS;
    }
}
