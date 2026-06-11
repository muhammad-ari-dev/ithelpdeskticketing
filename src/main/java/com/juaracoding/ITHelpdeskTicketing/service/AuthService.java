package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.config.JwtConfig;
import com.juaracoding.ITHelpdeskTicketing.dto.LeadResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.LoginDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.LoginResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.handler.ResponseHandler;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepo;
import com.juaracoding.ITHelpdeskTicketing.security.BcryptImpl;
import com.juaracoding.ITHelpdeskTicketing.security.CryptoJwt;
import com.juaracoding.ITHelpdeskTicketing.security.JwtUtility;
import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final EmployeeRepo employeeRepo;
    private final RoleRepo roleRepo;
    private final EmailService emailService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private JwtUtility jwtUtility;

    // =========================================================
    // FITUR 1: LOGIN
    // =========================================================

    /**
     * Memproses login dan mengembalikan JWT token jika berhasil.
     *
     * ALUR:
     *   1. Cek apakah employee null (harusnya tidak terjadi jika @Valid berjalan)
     *   2. Cari employee di DB berdasarkan userName
     *   3. Verifikasi password dengan BCrypt
     *   4. Cek status akun harus ACTIVE
     *   5. Buat JWT token dengan payload claims
     *   6. Return response dengan LoginResponseDTO (bukan HashMap manual lagi)
     *
     * PERUBAHAN dari versi sebelumnya:
     *   ❌ Sebelum : pakai HashMap manual → bocorkan full object Role
     *   ✅ Sekarang: pakai LoginResponseDTO → hanya field yang aman dan dibutuhkan
     */
    public ResponseEntity<Object> login(Employee employee, HttpServletRequest request) {

        // Safeguard: jika employee null (seharusnya sudah dicegah @Valid di controller)
        if (employee == null) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.USER_NOT_FOUND, HttpStatus.BAD_REQUEST, null, request);
        }

        // Cari employee di DB berdasarkan userName yang dikirim
        Optional<Employee> optionalEmployee = employeeRepo.findByUserName(employee.getUserName());
        if (optionalEmployee.isEmpty()) {
            // Sengaja pesan error dibuat generik ("Username atau Password Salah")
            // MENGAPA? Agar attacker tidak tahu apakah username-nya benar atau salah
            // (teknik ini disebut: tidak membocorkan informasi enumerasi user)
            throw new UsernameNotFoundException(ConstantMessage.USER_PWD_SALAH);
        }

        Employee employeeDb = optionalEmployee.get();

        /**
         * Verifikasi password dengan BCrypt
         *
         * PENTING — Pola verifikasi: userName + inputPassword
         * Ini HARUS konsisten dengan cara password di-hash saat:
         *   - SeedData   : BcryptImpl.hash(userName + "Admin@123!")
         *   - setPassword: BcryptImpl.hash(userName + newPassword)
         *
         * Kenapa digabung dengan userName?
         * → Ini adalah "salting manual" tambahan di atas BCrypt built-in salt.
         *   Membuat rainbow table attack lebih sulit karena tiap user
         *   punya "bumbu" berbeda (userNamenya).
         */
        if (!BcryptImpl.verifyHash(employeeDb.getUserName() + employee.getPassword(), employeeDb.getPassword())) {
            throw new UsernameNotFoundException(ConstantMessage.USER_PWD_SALAH);
        }

        // Akun harus berstatus ACTIVE
        // PENDING  → sudah register tapi belum set password via magic link
        // ACTIVE   → sudah set password, bisa login
        if (!employeeDb.getAccountStatus().equals("ACTIVE")) {
            throw new UsernameNotFoundException(ConstantMessage.ACCOUNT_NOT_ACTIVE);
        }

        /**
         * BUAT JWT TOKEN
         *
         * Claims = payload/isi token. Data ini bisa dibaca dari token
         * tanpa query ke DB (itulah keunggulan JWT: stateless).
         *
         * Data yang dimasukkan ke claims dipilih yang:
         *   1. Sering dibutuhkan oleh service lain / controller
         *   2. TIDAK sensitif (jangan masukkan password, magicToken, dll)
         *
         * Token ditandatangani dengan secret key → tidak bisa dipalsukan.
         */
        Map<String, Object> claims = new HashMap<>();
        claims.put("id",       employeeDb.getId());
        claims.put("nama",     employeeDb.getEmployeeName());
        claims.put("username", employeeDb.getUserName());
        claims.put("email",    employeeDb.getEmail());
        claims.put("no_hp",    employeeDb.getNoHp());
        claims.put("role",     employeeDb.getRole().getRoleName()); // hanya nama role, bukan object
        claims.put("lead_id",  employeeDb.getLead() != null ? employeeDb.getLead().getId() : null);
        // ↑ PERBAIKAN: sebelumnya kirim full object Lead ke dalam token → boros & berisiko
        //   Sekarang hanya kirim UUID lead saja (atau null jika tidak punya lead)

        String token = jwtUtility.doGenerateToken(claims, employeeDb.getUserName());

        // Enkripsi token jika fitur enkripsi aktif di jwt.properties (token.enable.encrypt=y)
        if (JwtConfig.getTokenEncryptEnable().equals("y")) {
            token = CryptoJwt.performEncrypt(token);
        }

        /**
         * BUAT RESPONSE DENGAN LoginResponseDTO
         *
         * PERUBAHAN dari versi sebelumnya:
         *   ❌ Sebelum: HashMap manual → rawan lupa field, kirim full object Role
         *   ✅ Sekarang: LoginResponseDTO → terstruktur, hanya field yang aman
         *
         * LoginResponseDTO berisi: id, employeeName, userName, email, roleName, token
         */
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", java.util.Locale.ENGLISH);
        String createdAt = employeeDb.getCreatedAt().format(formatter);
        LoginResponseDTO responseDTO = new LoginResponseDTO(employeeDb, createdAt, token);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_LOGIN, HttpStatus.OK, responseDTO, request);
    }

    // =========================================================
    // FITUR 2: REGISTRASI EMPLOYEE (oleh Admin)
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

    // =========================================================
    // UTILITY
    // =========================================================

    /**
     * Mapping LoginDTO → Employee entity menggunakan ModelMapper
     *
     * Dipakai di AuthController sebelum memanggil login():
     *   authService.login(authService.mapToEntity(loginDTO), request)
     *
     * ModelMapper otomatis mapping field yang namanya sama:
     *   LoginDTO.userName  → Employee.userName
     *   LoginDTO.password  → Employee.password
     */
    public Employee mapToEntity(LoginDTO loginDTO) {
        return modelMapper.map(loginDTO, Employee.class);
    }

    /**
     * Load user berdasarkan username — dipanggil oleh JwtFilter
     *
     * Setiap request yang membawa JWT token, JwtFilter akan:
     *   1. Extract username dari token
     *   2. Panggil loadUserByUsername(username) ini
     *   3. Set authentication ke SecurityContext
     *
     * Ini adalah implementasi wajib dari UserDetailsService
     * yang dibutuhkan Spring Security.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Employee> optionalEmployee = employeeRepo.findByUserName(username);
        if (optionalEmployee.isEmpty()) {
            throw new UsernameNotFoundException(ConstantMessage.USER_NOT_FOUND);
        }
        Employee employee = optionalEmployee.get();

        /**
         * Return User (bawaan Spring Security) dengan 3 parameter:
         *   1. username  : identitas user
         *   2. password  : password ter-hash (untuk verifikasi internal Spring)
         *   3. authorities: list permission/role (kosong karena kita handle manual via JWT claims)
         */
        List<GrantedAuthority> grantedAuthority = new ArrayList<>();
        return new User(employee.getUserName(), employee.getPassword(), grantedAuthority);
    }
}
