package com.juaracoding.ITHelpdeskTicketing.dto;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import lombok.Data;
import java.util.UUID;

/**
 * DTO untuk response setelah login berhasil.
 *
 * ATURAN SIMPEL:
 * Kirim HANYA data yang dibutuhkan frontend — tidak lebih, tidak kurang.
 *
 * Yang TIDAK dikirim (sengaja dihapus):
 *   ❌ password      → sensitif, tidak boleh pernah keluar dari server
 *   ❌ userName      → tidak perlu ditampilkan di frontend
 *   ❌ magicToken    → data internal sistem
 *   ❌ accountStatus → data internal sistem
 *   ❌ createdBy, updatedBy, dll → data audit internal
 */
@Data
public class LoginResponseDTO {

    /** ID unik employee — dibutuhkan frontend untuk referensi data */
    private String id;

    /**
     * Nama lengkap employee.
     * Dipakai untuk ditampilkan di profile/header UI.
     * Contoh: "Selamat datang, Hakim Nugraha!"
     *
     * MENGAPA BUKAN USERNAME?
     * Nama asli lebih user-friendly untuk ditampilkan di UI
     * dibanding username seperti "hakim.123_"
     */
    private String employeeName;
    private String username;

    /** Email — untuk ditampilkan di halaman profile */
    // private String email;

    /**
     * Nama role — hanya String nama rolenya saja.
     * Dipakai frontend untuk:
     *   - Tampilkan badge role di UI
     *   - Kontrol menu yang muncul (admin vs lead vs employee)
     *
     * MENGAPA BUKAN FULL OBJECT ROLE?
     * Full object Role berisi createdBy, createdAt, dll
     * yang tidak dibutuhkan frontend sama sekali.
     */
    private String roleName;
    private String roleDesc;
    private String createdAt;
    /**
     * JWT Token — wajib ada di response login.
     *
     * Frontend simpan token ini lalu kirim di setiap request berikutnya
     * via header: Authorization: Bearer <token>
     *
     * Tanpa token ini, frontend tidak bisa akses endpoint yang butuh login.
     */
    private String token;

    /**
     * Constructor — dipanggil di AuthService saat login berhasil.
     *
     * Cara pakainya di AuthService:
     *   LoginResponseDTO responseDTO = new LoginResponseDTO(employeeDb, token);
     *
     * PENTING: pakai employeeDb (data dari DB), BUKAN employee (data dari request)
     * karena employeeDb sudah lengkap dengan role, nama, dll.
     *
     * @param employee : data employee dari DB (employeeDb)
     * @param token    : JWT token yang baru dibuat
     */
    public LoginResponseDTO(Employee employee,String createdAt, String token) {
        this.id           = employee.getId().toString();
        this.employeeName = employee.getEmployeeName();
        this.username     = employee.getUserName();
        this.roleName     = employee.getRole().getRoleName();
        this.roleDesc     = employee.getRole().getRoleDesc();
        this.createdAt    = createdAt;
        this.token        = token;
    }
}
