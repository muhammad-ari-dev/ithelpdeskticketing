package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.config.JwtConfig;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.LoginDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.LoginResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.handler.ResponseHandler;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
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
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    @Autowired
    private EmployeeRepo employeeRepo;

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
//        claims.put("id",       employeeDb.getId());
//        claims.put("nama",     employeeDb.getEmployeeName());
//        claims.put("username", employeeDb.getUserName());
//        claims.put("email",    employeeDb.getEmail());
//        claims.put("no_hp",    employeeDb.getNoHp());
        claims.put("roleName",     employeeDb.getRole().getRoleName()); // hanya nama role, bukan object
//        claims.put("lead_id",  employeeDb.getLead() != null ? employeeDb.getLead().getId() : null);
        // ↑ PERBAIKAN: sebelumnya kirim full object Lead ke dalam token → boros & berisiko
        //   Sekarang hanya kirim UUID lead saja (atau null jika tidak punya lead)

        String token = jwtUtility.doGenerateToken(claims, employeeDb.getUserName());

        // Enkripsi token jika fitur enkripsi aktif di jwt.properties (token.enable.encrypt=y)
//        if (JwtConfig.getTokenEncryptEnable().equals("y")) {
//            token = CryptoJwt.performEncrypt(token);
//        }

        /**
         * BUAT RESPONSE DENGAN LoginResponseDTO
         *
         * PERUBAHAN dari versi sebelumnya:
         *   ❌ Sebelum: HashMap manual → rawan lupa field, kirim full object Role
         *   ✅ Sekarang: LoginResponseDTO → terstruktur, hanya field yang aman
         *
         * LoginResponseDTO berisi: id, employeeName, userName, email, roleName, token
         */
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", java.util.Locale.ENGLISH);
//        String createdAt = employeeDb.getCreatedAt().format(formatter);
        LoginResponseDTO responseDTO = new LoginResponseDTO(token);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_LOGIN, HttpStatus.OK, responseDTO, request);
    }

    // =========================================================
    // FITUR 2: SET PASSWORD (oleh Employee via Magic Link)
    // =========================================================
    @Transactional
    public ResponseEntity<Object> setPassword(SetPasswordDTO setPasswordDTO, HttpServletRequest request) {

        if (!setPasswordDTO.getNewPassword().equals(setPasswordDTO.getConfirmPassword())) {
            throw new RuntimeException(ConstantMessage.PWD_ERROR);
        }

        Optional<Employee> optionalEmployee = employeeRepo.findByMagicToken(setPasswordDTO.getMagicToken());
        if(optionalEmployee.isEmpty()){
            throw new RuntimeException(ConstantMessage.TOKEN_ERROR);
        }
        Employee employee = optionalEmployee.get();

        if (LocalDateTime.now().isAfter(employee.getMagicTokenExpiryAt())) {
            throw new RuntimeException(ConstantMessage.TOKEN_ERROR);
        }

        employee.setPassword(BcryptImpl.hash(employee.getUserName() + setPasswordDTO.getNewPassword()));
        employee.setAccountStatus("ACTIVE");
        employee.setMagicToken(null);
        employee.setMagicTokenExpiryAt(null);
        employeeRepo.save(employee);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_SAVE, HttpStatus.OK, null, request);

       // return "Password berhasil diset! Akun sekarang sudah aktif. Silakan login.";
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
