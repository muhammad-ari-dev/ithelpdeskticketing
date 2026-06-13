package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.dto.LeadResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepo;
import com.juaracoding.ITHelpdeskTicketing.security.BcryptImpl;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
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

    /**
     * Mendaftarkan employee baru dan mengirim magic link ke email mereka.
     *
     * ALUR:
     *   1. Cek duplikasi userName dan email
     *   2. Mapping data dari DTO ke Entity
     *   3. Set role berdasarkan roleName
     *   4. Logika hierarki: LEAD tidak punya atasan, EMPLOYEE wajib punya Lead
     *   5. Status awal: PENDING (belum bisa login sampai set password)
     *   6. Generate magic token (UUID) → simpan ke DB
     *   7. Kirim email berisi link dengan magic token
     *
     * @Transactional → Jika ada error di tengah proses (misal gagal kirim email),
     *                  semua perubahan DB di-rollback otomatis.
     *                  Mencegah data setengah jadi tersimpan di DB.
     */
    @Transactional
    public String registerEmployee(RegisDTO dto) {

        // Validasi duplikasi — cek sebelum insert untuk hindari constraint violation di DB
        if (employeeRepo.existsByUserName(dto.getUserName())) {
            return "Error: Username sudah dipakai!";
        }
        if (employeeRepo.existsByEmail(dto.getEmail())) {
            return "Error: Email sudah terdaftar!";
        }

        // Mapping field dari DTO ke Entity
        Employee employee = new Employee();
        employee.setEmployeeName(dto.getEmployeeName());
        employee.setUserName(dto.getUserName());
        employee.setEmail(dto.getEmail());
        employee.setNoHp(dto.getNoHp());

        /**
         * Password default sementara
         *
         * Employee belum punya password sungguhan saat ini.
         * Password ini TIDAK akan dipakai untuk login karena:
         *   1. Status akun masih PENDING → login ditolak
         *   2. Saat set-password nanti, password ini akan ditimpa
         *
         * Ini hanya untuk memenuhi constraint NOT NULL di kolom Password di DB.
         */
        employee.setPassword(BcryptImpl.hash(dto.getUserName() + "DEFAULT_PASSWORD_TEMP"));
        employee.setCreatedBy("ADMIN");

        // Set role berdasarkan roleName yang dikirim — cari di DB
        Role role = roleRepo.findByRoleName(dto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Error: Role '" + dto.getRoleName() + "' tidak ditemukan!"));
        employee.setRole(role);

        /**
         * Logika Hierarki Lead vs Employee
         *
         * LEAD (atau ADMINISTRATOR):
         *   → Tidak punya atasan (lead = null)
         *
         * EMPLOYEE:
         *   → WAJIB punya Lead
         *   → leadID dari DTO di-parse ke UUID lalu dicari di DB
         *   → Jika leadID kosong atau tidak ditemukan → throw error
         */
        if ("LEAD".equalsIgnoreCase(role.getRoleName()) ||
                "ADMINISTRATOR".equalsIgnoreCase(role.getRoleName())) {
            employee.setLead(null);
        } else {
            // role EMPLOYEE — wajib ada lead
            if (dto.getLeadID() == null || dto.getLeadID().isEmpty()) {
                throw new RuntimeException("Error: Staff wajib memiliki Lead!");
            }
            UUID leadUuid = UUID.fromString(dto.getLeadID());
            Employee atasan = employeeRepo.findById(leadUuid)
                    .orElseThrow(() -> new RuntimeException("Error: ID Lead tidak ditemukan!"));
            employee.setLead(atasan);
        }

        // Status PENDING → tidak bisa login sampai klik magic link dan set password
        employee.setAccountStatus("PENDING");

        /**
         * Generate Magic Token
         *
         * UUID.randomUUID() → menghasilkan string unik sepanjang 36 karakter
         * contoh: "550e8400-e29b-41d4-a716-446655440000"
         *
         * Token ini dikirim via email sebagai query param link:
         * http://frontend.com/set-password?token=550e8400-e29b-41d4-a716-446655440000
         *
         * Saat employee klik link → frontend kirim token ini ke endpoint /set-password
         */
        String magicToken = UUID.randomUUID().toString();
        employee.setMagicToken(magicToken);

        // Simpan ke DB
        employeeRepo.save(employee);

        // Kirim email magic link
        emailService.sendMagicLink(employee.getEmail(), magicToken);

        return "Sukses: Employee berhasil didaftarkan! Email setup password sudah dikirim ke " + employee.getEmail();
    }

    // =========================================================
    // FITUR 3: SET PASSWORD (oleh Employee via Magic Link)
    // =========================================================

    /**
     * Mengaktifkan akun employee dengan mengeset password baru.
     *
     * ALUR:
     *   1. Validasi newPassword == confirmPassword
     *   2. Cari employee berdasarkan magicToken
     *   3. Hash password baru dengan pola: userName + newPassword
     *   4. Ubah status dari PENDING → ACTIVE
     *   5. Hapus magicToken (one-time use!)
     *   6. Simpan
     *
     * @Transactional → Rollback otomatis jika ada error
     */
    @Transactional
    public String setPassword(SetPasswordDTO dto) {

        // Validasi kesamaan password — tidak bisa dilakukan di @Pattern (beda field)
        // Ini harus tetap ada di service
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Password baru dan konfirmasi tidak cocok!");
        }

        // Cari employee berdasarkan magic token
        // Jika tidak ditemukan → token salah atau sudah pernah dipakai (sudah null)
        Employee employee = employeeRepo.findByMagicToken(dto.getMagicToken())
                .orElseThrow(() -> new RuntimeException("Token tidak valid atau sudah kedaluwarsa!"));

        /**
         * Hash password baru
         *
         * POLA: BcryptImpl.hash(userName + newPassword)
         * HARUS KONSISTEN dengan verifikasi di login():
         *   BcryptImpl.verifyHash(userName + inputPassword, hashedPassword)
         */
        employee.setPassword(BcryptImpl.hash(employee.getUserName() + dto.getNewPassword()));

        // Aktifkan akun → sekarang bisa login
        employee.setAccountStatus("ACTIVE");

        /**
         * Hapus magic token setelah dipakai
         *
         * PENTING! Magic token bersifat ONE-TIME USE.
         * Setelah dipakai untuk set password, harus langsung dihapus (set null).
         * Jika tidak dihapus → link email yang sama bisa dipakai berkali-kali
         * oleh siapa saja yang punya akses ke email tersebut.
         */
        employee.setMagicToken(null);

        employeeRepo.save(employee);

        return "Password berhasil diset! Akun sekarang sudah aktif. Silakan login.";
    }

    // =========================================================
    // FITUR 4: GET ALL LEADS (untuk dropdown saat register Employee)
    // =========================================================

    /**
     * Mengambil semua employee dengan role LEAD.
     *
     * Dipakai di endpoint GET /api/auth/leads.
     * Frontend menampilkan daftar ini sebagai dropdown saat Admin
     * mendaftarkan Employee baru — untuk memilih siapa atasannya.
     *
     * Return LeadResponseDTO (bukan Employee entity) → hanya kirim
     * field yang dibutuhkan frontend: id, nama, username, email.
     */
    public List<LeadResponseDTO> getAllLeads() {
        return employeeRepo.findByRole_RoleNameIgnoreCase("LEAD")
                .stream()
                .map(LeadResponseDTO::new)
                .collect(Collectors.toList());
    }
}
