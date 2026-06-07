package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.config.JwtConfig;
import com.juaracoding.ITHelpdeskTicketing.dto.LoginDTO;
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

import com.juaracoding.ITHelpdeskTicketing.dto.LeadResponseDTO;

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

    // --- FITUR LOGIN ---
    public ResponseEntity<Object> login(Employee employee, HttpServletRequest request) {
//        v1
//        Employee employee = employeeRepo.findByUserName(request.getUserName())
//                .orElseThrow(() -> new RuntimeException("Username tidak ditemukan!"));
//
//        if (!employee.getPassword().equals(request.getPassword())) {
//            throw new RuntimeException("Password salah!");
//        }
//
//        if (!"ACTIVE".equals(employee.getAccountStatus())) {
//            throw new RuntimeException("Akun belum aktif! Cek email untuk aktivasi.");
//        }
//
//        return new LoginResponseDTO(employee);
//      v2 -> pake response token jwt
        if (employee==null){
            return new ResponseHandler().
                    handleResponse(ConstantMessage.USER_NOT_FOUND, HttpStatus.BAD_REQUEST, null, request);
        }
        Optional<Employee> optionalEmployee = employeeRepo.findByUserName(employee.getUserName());
        if (optionalEmployee.isEmpty()){
            throw new UsernameNotFoundException(ConstantMessage.USER_PWD_SALAH);
        }
        Employee employeeDb = optionalEmployee.get();
        if(!BcryptImpl.verifyHash(employeeDb.getUserName()+employee.getPassword(), employeeDb.getPassword())){
            throw new UsernameNotFoundException(ConstantMessage.USER_PWD_SALAH);
        }
        if(!employeeDb.getAccountStatus().equals("ACTIVE")){
            throw new UsernameNotFoundException(ConstantMessage.ACCOUNT_NOT_ACTIVE);
        }
        /** PAYLOAD */
        Map<String,Object> claims = new HashMap<>();
        claims.put("id", employeeDb.getId());
        claims.put("nama", employeeDb.getEmployeeName());
        claims.put("username", employeeDb.getUserName());
        claims.put("email", employeeDb.getEmail());
        claims.put("no_hp", employeeDb.getNoHp());
        claims.put("role", employeeDb.getRole().getRoleName());
        claims.put("lead_id", employeeDb.getLead());
        String token = jwtUtility.doGenerateToken(claims, employeeDb.getUserName());
        if(JwtConfig.getTokenEncryptEnable().equals("y")){
            token = CryptoJwt.performEncrypt(token);
        }
        Map<String,Object> mapResponse = new HashMap<>();
        mapResponse.put("token", token);
        mapResponse.put("nama", employeeDb.getEmployeeName());
        mapResponse.put("username", employeeDb.getUserName());
        mapResponse.put("role", employeeDb.getRole());
        return new ResponseHandler().
                handleResponse(ConstantMessage.SUCCESS_LOGIN, HttpStatus.OK, mapResponse,request);
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
        employee.setPassword(BcryptImpl.hash(dto.getUserName()+"DEFAULT_PASSWORD_123"));
        employee.setCreatedBy("ADMIN"); // Sesuai permintaan lu buat audit trail

        // 3. Set Role
        Role role = roleRepo.findByRoleName(dto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Error: Role '" + dto.getRoleName() + "' tidak ditemukan!"));
        employee.setRole(role);

        // 4. Logika Hierarki (Lead vs Staff)
        if ("ADMINISTRATOR".equalsIgnoreCase(role.getRoleName()) || "LEAD".equalsIgnoreCase(role.getRoleName())) {
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
        if("ADMINISTRATOR".equalsIgnoreCase(role.getRoleName())){
            employee.setAccountStatus("ACTIVE");
        } else {
            employee.setAccountStatus("PENDING");
        }
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
        employee.setPassword(BcryptImpl.hash(employee.getUserName()+dto.getNewPassword())); // sudah di hash
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

    // Model Mapper
    public Employee mapToEntity(LoginDTO loginDTO){
        return modelMapper.map(loginDTO,Employee.class);
    }

    /**
     * method ini digunakan untuk validasi username dari token jwt
     * @param username the username identifying the user whose data is required.
     * @return
     * @throws UsernameNotFoundException
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Employee> optionalEmployee = employeeRepo.findByUserName(username);
        if (optionalEmployee.isEmpty()){
            throw new UsernameNotFoundException(ConstantMessage.USER_NOT_FOUND);
        }
        Employee employee = optionalEmployee.get();
        List<GrantedAuthority> grantedAuthority = new ArrayList<>();
        return new User(employee.getUserName(), employee.getPassword(), grantedAuthority);
    }
}