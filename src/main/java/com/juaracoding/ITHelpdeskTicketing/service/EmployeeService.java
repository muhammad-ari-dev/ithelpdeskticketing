package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.dto.response.EmployeesResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.ProfileResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.ChangePasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.EditEmployeeDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.LeadResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.UpdateEmployeeDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.handler.ResponseHandler;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepo;
import com.juaracoding.ITHelpdeskTicketing.security.BcryptImpl;
import com.juaracoding.ITHelpdeskTicketing.security.JwtUtility;
import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    JwtUtility jwtUtility;

    public ResponseEntity<Object> getEmployees(HttpServletRequest request){

        // 1. Get all employees, with employees without a lead first
        List<Employee> employees = employeeRepo.findAllOrphanFirst();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);

        // 2. Map list elements to DTOs correctly using Streams
        List<EmployeesResponseDTO> dtoList = employees.stream().map(employee -> {
            EmployeesResponseDTO dto = modelMapper.map(employee, EmployeesResponseDTO.class);

            dto.setId(employee.getId());
            dto.setStatus(employee.getAccountStatus());
            // Format Updated Date conditionally
            dto.setCreatedAt(employee.getCreatedAt().format(formatter));
            if ("INACTIVE".equals(employee.getAccountStatus()) && employee.getUpdatedAt() != null) {
                dto.setUpdatedAt(employee.getUpdatedAt().format(formatter));
            } else {
                dto.setUpdatedAt(null);
            }

            // Map Role Name safely
            if (employee.getRole() != null) {
                dto.setRoleName(employee.getRole().getRoleName());
            }

            // Map Leader Name safely (Handles null leads)
            if (employee.getLead() != null) {
                dto.setLeadID(employee.getLead().getId().toString());
                dto.setLeaderName(employee.getLead().getEmployeeName());
            }

            return dto;
        }).toList();

        // 3. Return the list of DTOs
        return new ResponseHandler()
                .handleResponse(ConstantMessage.OK, HttpStatus.OK, dtoList, request);

    }

    public ResponseEntity<Object> getProfile(String username, HttpServletRequest request) {

        // 1. Find employee or return 404 immediately if not found
        Employee employeeDb = employeeRepo.findByUserName(username)
                .orElse(null);

        if (employeeDb == null) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.USER_NOT_FOUND, HttpStatus.NOT_FOUND, null, request);
        }

        // 2. Map to DTO
        ProfileResponseDTO profile = modelMapper.map(employeeDb, ProfileResponseDTO.class);

        // 3. Format Date
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);
        profile.setCreatedAt(employeeDb.getCreatedAt().format(formatter));

        // 4. Return successful response
        return new ResponseHandler()
                .handleResponse(ConstantMessage.OK, HttpStatus.OK, profile, request);

    }

    // =========================================================
    // FITUR 6: CHANGE PASSWORD (oleh Employee sendiri)
    // =========================================================

    /**
     * Employee/Lead mengganti password mereka sendiri.
     * <p>
     * ALUR:
     * 1. Ambil username dari JWT token (SecurityContext)
     * 2. Cari employee di DB berdasarkan username
     * 3. Verifikasi password lama
     * 4. Cek password baru != password lama
     * 5. Cek newPassword == confirmPassword
     * 6. Hash password baru dan simpan
     * <p>
     * MENGAPA AMBIL USERNAME DARI TOKEN, BUKAN DARI REQUEST BODY?
     * → Lebih aman! Employee tidak bisa ganti password orang lain
     * dengan mengirim username orang lain di request body.
     * Username diambil dari JWT token yang sudah diverifikasi
     * oleh JwtFilter — dijamin adalah pemilik akun yang sedang login.
     *
     * @Transactional → Rollback otomatis jika ada error saat simpan
     */
    @Transactional
    public ResponseEntity<Object> changePassword(String username, ChangePasswordDTO changePasswordDTO, HttpServletRequest request) {

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
//        String username = SecurityContextHolder.getContext()
//                .getAuthentication()
//                .getName(); // ambil username dari token JWT yang sudah diverifikasi

        // Cari employee di DB berdasarkan username dari token
        // 1. Fetch employee securely or return 404 immediately
        Employee employee = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException(ConstantMessage.USER_NOT_FOUND));
        /**
         * Verifikasi password lama
         *
         * POLA: BcryptImpl.verifyHash(userName + oldPassword, hashedPassword)
         * HARUS KONSISTEN dengan cara password di-hash saat setPassword()
         */
        if (!BcryptImpl.verifyHash(employee.getUserName() + changePasswordDTO.getOldPassword(), employee.getPassword())) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.OLD_PASSWORD_WRONG, HttpStatus.BAD_REQUEST, null, request);
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
        if (BcryptImpl.verifyHash(employee.getUserName() + changePasswordDTO.getNewPassword(), employee.getPassword())) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.SAME_PASSWORD, HttpStatus.BAD_REQUEST, null, request);
        }

        // Cek newPassword == confirmPassword
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.CONFIRM_PWD_ERROR, HttpStatus.BAD_REQUEST, null, request);
        }

        // Hash password baru dan simpan
        employee.setPassword(BcryptImpl.hash(employee.getUserName() + changePasswordDTO.getNewPassword()));
        employee.setUpdatedBy(username);
        employeeRepo.save(employee);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_CHANGE_PASS, HttpStatus.OK, null, request);

    }

    // =========================================================
    // FITUR: GET ALL LEADS
    // =========================================================
    public ResponseEntity<Object> getAllLeads(HttpServletRequest request) {

        // 1. Directly fetch all employees with the role 'LEAD'
        List<Employee> leads = employeeRepo.findByRole_RoleNameIgnoreCase("LEAD");

        // 2. Map the entities directly to DTOs
        List<LeadResponseDTO> leadsDtoList = leads.stream()
                .map(employee -> modelMapper.map(employee, LeadResponseDTO.class))
                .toList();

        return new ResponseHandler()
                .handleResponse(ConstantMessage.OK, HttpStatus.OK, leadsDtoList, request);

    }

    // =========================================================
    // FITUR: REGISTRASI EMPLOYEE (oleh Admin)
    // =========================================================
    @Transactional
    public ResponseEntity<Object> registerEmployee(RegisDTO regisDTO, HttpServletRequest request) {

        if (employeeRepo.existsByUserName(regisDTO.getUserName())) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.ALREADY_EXISTS, HttpStatus.CONFLICT, null, request);
        }
        if (employeeRepo.existsByEmail(regisDTO.getEmail())) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.ALREADY_EXISTS, HttpStatus.CONFLICT, null, request);
        }

        Employee employee = new Employee();
        employee.setEmployeeName(regisDTO.getEmployeeName());
        employee.setUserName(regisDTO.getUserName());
        employee.setEmail(regisDTO.getEmail());
        employee.setNoHp(regisDTO.getNoHp());
        employee.setPassword(BcryptImpl.hash(regisDTO.getUserName() + "DEFAULT_PASSWORD_TEMP"));
        employee.setCreatedBy("ADMIN");

        Role role = roleRepo.findByRoleName(regisDTO.getRoleName())
                .orElse(null);
        if (role == null) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.NOT_FOUND, HttpStatus.NOT_FOUND, null, request);
        }
        employee.setRole(role);

        if ("LEAD".equalsIgnoreCase(role.getRoleName()) ||
                "ADMINISTRATOR".equalsIgnoreCase(role.getRoleName())) {
            employee.setLead(null);
        } else {
            if (regisDTO.getLeadID() == null || regisDTO.getLeadID().isEmpty()) {
                throw new RuntimeException(ConstantMessage.NOT_NULL);
            }
            UUID leadUuid = UUID.fromString(regisDTO.getLeadID());
            Optional<Employee> optionalEmployeeLead = employeeRepo.findById(leadUuid);
            if (optionalEmployeeLead.isEmpty()) {
                throw new RuntimeException(ConstantMessage.NOT_FOUND);
            }
            Employee lead = optionalEmployeeLead.get();
            employee.setLead(lead);
        }

        employee.setAccountStatus("PENDING");

        String magicToken = UUID.randomUUID().toString();
        employee.setMagicToken(magicToken);
        employee.setMagicTokenExpiryAt(LocalDateTime.now().plusDays(7));

        employeeRepo.save(employee);
        emailService.sendMagicLink(employee.getEmail(), magicToken);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.OK, HttpStatus.OK, null, request);

    }

    @Transactional
    public ResponseEntity<Object> editEmployee(UpdateEmployeeDTO updateEmployeeDTO, HttpServletRequest request){

        UUID employeeId = UUID.fromString(updateEmployeeDTO.getEmployeeId());
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(ConstantMessage.USER_NOT_FOUND));

        Role previousRole = employee.getRole();
        Role updatedRole = roleRepo.findByRoleName(updateEmployeeDTO.getRoleName())
                .orElseThrow(() -> new RuntimeException(ConstantMessage.NOT_FOUND));

        employee.setEmployeeName(updateEmployeeDTO.getEmployeeName());
        employee.setEmail(updateEmployeeDTO.getEmail());
        employee.setNoHp(updateEmployeeDTO.getNoHp());
        employee.setRole(updatedRole);
        employee.setUpdatedBy("ADMIN");

        if ("LEAD".equals(previousRole.getRoleName()) && !"LEAD".equals(updatedRole.getRoleName())) {
            List<Employee> staffList = employeeRepo.findByLead(employee);
            for (Employee staff : staffList) {
                staff.setLead(null);
            }
            employeeRepo.saveAll(staffList);
        }

        if ("LEAD".equals(updatedRole.getRoleName()) || "ADMINISTRATOR".equals(updatedRole.getRoleName())) {
            employee.setLead(null);
        } else {
            if (updateEmployeeDTO.getLeadID() == null || updateEmployeeDTO.getLeadID().isBlank()) {
                employee.setLead(null);
            } else {
                UUID leadUuid = UUID.fromString(updateEmployeeDTO.getLeadID());
                Employee lead = employeeRepo.findById(leadUuid)
                        .orElseThrow(() -> new RuntimeException(ConstantMessage.NOT_FOUND));
                employee.setLead(lead);
            }
        }

        employeeRepo.save(employee);

        if ("LEAD".equals(updatedRole.getRoleName())) {
            Set<String> selectedStaffIds = new HashSet<>(
                    updateEmployeeDTO.getStaffIds() == null ? List.of() : updateEmployeeDTO.getStaffIds()
            );

            List<Employee> currentStaffList = employeeRepo.findByLead(employee);
            for (Employee staff : currentStaffList) {
                if (!selectedStaffIds.contains(staff.getId().toString())) {
                    staff.setLead(null);
                }
            }
            employeeRepo.saveAll(currentStaffList);

            for (String staffId : selectedStaffIds) {
                UUID staffUuid = UUID.fromString(staffId);
                if (staffUuid.equals(employee.getId())) {
                    continue;
                }

                Employee staff = employeeRepo.findById(staffUuid)
                        .orElseThrow(() -> new RuntimeException(ConstantMessage.NOT_FOUND));
                staff.setLead(employee);
                employeeRepo.save(staff);
            }
        }

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_UPDATE, HttpStatus.OK, updateEmployeeDTO, request);
    }

    // =========================================================
    // FITUR 4: DISABLE USER (oleh Admin)
    // =========================================================

    /**
     * Admin menonaktifkan akun employee/lead.
     * <p>
     * ALUR:
     * 1. Cari employee berdasarkan ID
     * 2. Cek apakah akun sudah INACTIVE (tidak perlu proses lagi)
     * 3. Ubah status dari ACTIVE → INACTIVE
     * 4. Simpan
     * <p>
     * MENGAPA STATUS "INACTIVE" BUKAN DIHAPUS?
     * → Soft delete — data tetap ada di DB untuk keperluan audit/history.
     * Kalau dihapus, riwayat tiket yang dibuat employee tersebut bisa ikut hilang.
     * <p>
     * EFEKNYA:
     * → Saat employee ini coba login, AuthService cek accountStatus == "ACTIVE"
     * → Karena INACTIVE, login akan ditolak dengan pesan "Akun Belum Aktif"
     *
     * @Transactional → Rollback otomatis jika ada error saat simpan
     */
    @Transactional
    public ResponseEntity<Object> disableUser(EditEmployeeDTO disableUserDTO, HttpServletRequest request) {

        // Parse String UUID → tipe UUID
        // Aman karena sudah divalidasi @Pattern di DTO sebelum sampai sini
        UUID employeeId = UUID.fromString(disableUserDTO.getEmployeeId());

        // Cari employee di DB berdasarkan ID
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(ConstantMessage.USER_NOT_FOUND));

        // Cek apakah akun sudah tidak aktif — tidak perlu proses dua kali
        if ("INACTIVE".equals(employee.getAccountStatus())) {
            return new ResponseHandler()
                    .handleResponse(ConstantMessage.ALREADY_INACTIVE, HttpStatus.BAD_REQUEST, null, request);
        }

        if("LEAD".equals(employee.getRole().getRoleName())){
            List<Employee> staffList = employeeRepo.findByLead(employee);
            for (Employee staff : staffList) {
                staff.setLead(null);
            }
            employeeRepo.saveAll(staffList);
        }

        // Ubah status → INACTIVE
        employee.setAccountStatus("INACTIVE");
        employee.setUpdatedBy("ADMIN");
        employeeRepo.save(employee);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_DISABLE_USER, HttpStatus.OK, disableUserDTO, request);
    }


    // =========================================================
    // FITUR 5: RESET PASSWORD USER (oleh Admin)
    // =========================================================

    /**
     * Admin mereset password employee/lead yang lupa password.
     * <p>
     * ALUR:
     * 1. Cari employee berdasarkan ID
     * 2. Generate magic token baru (UUID)
     * 3. Simpan magic token ke DB
     * 4. Ubah status ke PENDING (tidak bisa login sampai set password baru)
     * 5. Kirim magic link ke email employee
     * <p>
     * MENGAPA STATUS DIUBAH KE PENDING?
     * → Keamanan! Selama employee belum set password baru via magic link,
     * mereka tidak bisa login. Ini mencegah akun yang passwordnya di-reset
     * tetap bisa diakses dengan password lama.
     * <p>
     * FLOW SELANJUTNYA (setelah method ini):
     * Employee klik link di email
     * → Frontend buka halaman set-password
     * → Employee input password baru + konfirmasi
     * → Hit endpoint POST /api/employee/set-password
     * → Status kembali ACTIVE, magic token dihapus
     *
     * @Transactional → Rollback otomatis jika gagal kirim email
     */
    @Transactional
    public ResponseEntity<Object> resetPassUser(EditEmployeeDTO resetPasswordDTO, HttpServletRequest request) {
        // Pakai DisableUserDTO yang sama karena sama-sama hanya butuh employeeId
        // Tidak perlu buat DTO baru yang isinya sama persis

        UUID employeeId = UUID.fromString(resetPasswordDTO.getEmployeeId());

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

        employee.setMagicTokenExpiryAt(LocalDateTime.now().plusDays(7));

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

        return new ResponseHandler()
                .handleResponse(ConstantMessage.SUCCESS_RESET_PASS, HttpStatus.OK, resetPasswordDTO, request);
    }
}


