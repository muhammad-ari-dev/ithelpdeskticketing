package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.dto.LoginDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.SetPasswordDTO;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.juaracoding.ITHelpdeskTicketing.dto.LeadResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.LoginResponseDTO;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepo employeeRepo;
    private final RoleRepo roleRepo;
    private final EmailService emailService;

    // --- FITUR LOGIN ---
    public LoginResponseDTO login(LoginDTO request) {
        Employee employee = employeeRepo.findByUserName(request.getUserName())
                .orElseThrow(() -> new RuntimeException("Username tidak ditemukan!"));

        if (!employee.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Password salah!");
        }

        if (!"ACTIVE".equals(employee.getAccountStatus())) {
            throw new RuntimeException("Akun belum aktif! Cek email untuk aktivasi.");
        }

        return new LoginResponseDTO(employee);
    }

    // --- FITUR REGISTRASI (MAGIC LINK) ---
    @Transactional
    public String registerEmployee(RegisDTO dto) {
        // 1. Validasi Duplikasi
        if (employeeRepo.existsByUserName(dto.getUserName())) {
            return "Error: Username sudah dipakai!";
        }
        if (employeeRepo.existsByEmail(dto.getEmail())) {
            return "Error: Email sudah terdaftar!";
        }

        // 2. Mapping Data
        Employee employee = new Employee();
        employee.setEmployeeName(dto.getEmployeeName());
        employee.setUserName(dto.getUserName());
        employee.setEmail(dto.getEmail());
        employee.setNoHp(dto.getNoHp());

        // --- TAMBAHAN PENTING ---
        employee.setPassword("DEFAULT_PASSWORD_123"); // Biar gak null di DB
        employee.setCreatedBy("ADMIN"); // Sesuai permintaan lu buat audit trail

        // 3. Set Role
        Role role = roleRepo.findByRoleName(dto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Error: Role '" + dto.getRoleName() + "' tidak ditemukan!"));
        employee.setRole(role);

        // 4. Logika Hierarki (Lead vs Staff)
        if ("LEAD".equalsIgnoreCase(role.getRoleName())) {
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

        // 5. Setup Status
        employee.setAccountStatus("PENDING");
        String token = UUID.randomUUID().toString();
        employee.setMagicToken(token);

        // 6. Simpan ke Database
        employeeRepo.save(employee);

        // 7. Kirim Email
        emailService.sendMagicLink(employee.getEmail(), token);

        return "Sukses: Employee berhasil didaftarkan! Email setup password sudah dikirim.";
    }

    // --- FOKUS 3: SET PASSWORD ---
    @Transactional
    public String setPassword(SetPasswordDTO dto) {
        // 1. Validasi password match
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Password baru dan konfirmasi tidak cocok!");
        }

        // 2. Cari user berdasarkan token
        Employee employee = employeeRepo.findByMagicToken(dto.getMagicToken())
                .orElseThrow(() -> new RuntimeException("Token tidak valid atau sudah kedaluwarsa!"));

        // 3. Update data
        employee.setPassword(dto.getNewPassword()); // Nanti bisa ditambah hashing di sini
        employee.setAccountStatus("ACTIVE");
        employee.setMagicToken(null); // Hapus token biar gak bisa dipake lagi

        // 4. Simpan
        employeeRepo.save(employee);

        return "Password berhasil diset! Akun sekarang sudah aktif.";
    }

    public List<LeadResponseDTO> getAllLeads() {
        return employeeRepo.findByRole_RoleNameIgnoreCase("LEAD")
                .stream()
                .map(LeadResponseDTO::new)
                .collect(Collectors.toList());
    }
}