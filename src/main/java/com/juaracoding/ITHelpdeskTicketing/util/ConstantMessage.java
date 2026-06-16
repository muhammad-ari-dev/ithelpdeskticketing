package com.juaracoding.ITHelpdeskTicketing.util;

public class ConstantMessage {

    // =============================================
    // PESAN UMUM
    // =============================================
    public static final String NOT_BLANK  = "Wajib Diisi dengan karakter";
    public static final String NOT_NULL   = "Tidak boleh Null";
    public static final String NOT_EMPTY  = "Tidak boleh kosong";

    // =============================================
    // PESAN SUKSES
    // =============================================
    public static final String SUCCESS_SAVE     = "Berhasil menyimpan data";
    public static final String SUCCESS_DELETE   = "Berhasil menghapus data";
    public static final String SUCCESS_UPDATE   = "Berhasil mengubah data";
    public static final String OK               = "OK";
    public static final String SUCCESS_UPLOAD   = "Upload Berhasil";
    public static final String SUCCESS_REGIS    = "Registrasi Berhasil";
    public static final String SUCCESS_LOGIN    = "Login Berhasil";

    // =============================================
    // PESAN GAGAL UMUM
    // =============================================
    public static final String FAILED_SAVE      = "Gagal menyimpan data";
    public static final String FAILED_UPDATE    = "Gagal mengubah data";
    public static final String FAILED_DELETE    = "Gagal menghapus data";
    public static final String NOT_FOUND        = "Data tidak ditemukan";
    public static final String MUST_EXCEL       = "Format File Harus Excel";
    public static final String ALREADY_EXISTS   = "Data sudah ada";

    // =============================================
    // PESAN AUTH
    // =============================================
    public static final String FAILED_REGIS         = "Registrasi Gagal";
    public static final String USER_PWD_SALAH       = "Username atau Password Salah";
    public static final String PWD_ERROR            = "Password dan konfirmasi password tidak sama";
    public static final String OTP_SALAH            = "OTP Salah";
    public static final String USER_NOT_FOUND       = "User Tidak Ditemukan";
    public static final String ERROR_AUTH           = "Otentikasi Bermasalah";
    public static final String ACCOUNT_NOT_ACTIVE   = "Akun Belum Aktif";
    public static final String TOKEN_ERROR          = "Token invalid atau expired";

    // =============================================
    // PESAN FITUR BARU — EMPLOYEE MANAGEMENT
    // =============================================

    /** disableUser — akun berhasil dinonaktifkan */
    public static final String SUCCESS_DISABLE_USER  = "Akun berhasil dinonaktifkan";

    /** disableUser — akun sudah dalam kondisi tidak aktif */
    public static final String ALREADY_INACTIVE      = "Akun sudah dalam kondisi tidak aktif";

    /** resetPassUser — reset password berhasil, magic link terkirim */
    public static final String SUCCESS_RESET_PASS    = "Password berhasil direset! Magic link sudah dikirim ke email";

    /** changePassword — password berhasil diubah */
    public static final String SUCCESS_CHANGE_PASS   = "Password berhasil diubah";

    /** changePassword — password lama salah */
    public static final String OLD_PASSWORD_WRONG    = "Password lama tidak sesuai";

    /** changePassword — password baru sama dengan password lama */
    public static final String SAME_PASSWORD         = "Password baru tidak boleh sama dengan password lama";
    public static final String CONFIRM_PWD_ERROR     = "Konfirmasi password gagal";

    // =============================================
    // PESAN VALIDASI — USERNAME
    // =============================================
    public static final String USERNAME_NOT_BLANK = "Username tidak boleh kosong";
    public static final String USERNAME_SIZE      = "Username harus antara 3 hingga 64 karakter";
    public static final String USERNAME_INVALID   =
            "Username hanya boleh mengandung huruf, angka, titik (.), dan underscore (_)";

    // =============================================
    // PESAN VALIDASI — PASSWORD
    // =============================================
    public static final String PASSWORD_NOT_BLANK         = "Password tidak boleh kosong";
    public static final String PASSWORD_SIZE              = "Password harus antara 8 hingga 128 karakter";
    public static final String PASSWORD_NO_SPACE          = "Password tidak boleh mengandung spasi";
    public static final String PASSWORD_INVALID           =
            "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka";
    public static final String CONFIRM_PASSWORD_NOT_BLANK = "Konfirmasi password tidak boleh kosong";
    public static final String OLD_PASSWORD_NOT_BLANK     = "Password lama tidak boleh kosong";

    // =============================================
    // PESAN VALIDASI — NAMA
    // =============================================
    public static final String NAME_NOT_BLANK = "Nama tidak boleh kosong";
    public static final String NAME_SIZE      = "Nama harus antara 2 hingga 64 karakter";
    public static final String NAME_INVALID   =
            "Nama hanya boleh mengandung huruf, spasi, titik (.), apostrof ('), dan strip (-)";

    // =============================================
    // PESAN VALIDASI — EMAIL
    // =============================================
    public static final String EMAIL_NOT_BLANK = "Email tidak boleh kosong";
    public static final String EMAIL_INVALID   = "Format email tidak valid (contoh: nama@domain.com)";

    // =============================================
    // PESAN VALIDASI — NO HP
    // =============================================
    public static final String PHONE_NOT_BLANK = "Nomor HP tidak boleh kosong";
    public static final String PHONE_INVALID   =
            "Format nomor HP tidak valid. Gunakan format Indonesia (contoh: 081234567890 atau +6281234567890)";

    // =============================================
    // PESAN VALIDASI — ROLE
    // =============================================
    public static final String ROLE_NOT_BLANK = "Role tidak boleh kosong";
    public static final String ROLE_INVALID   =
            "Role tidak valid. Pilihan yang tersedia: ADMINISTRATOR, LEAD, EMPLOYEE";

    // =============================================
    // PESAN VALIDASI — LEAD ID
    // =============================================
    public static final String LEAD_ID_INVALID =
            "Format Lead ID tidak valid. Harus berupa UUID (contoh: 123e4567-e89b-12d3-a456-426614174000)";

    // =============================================
    // PESAN VALIDASI — EMPLOYEE ID
    // =============================================

    /** Field employeeId kosong */
    public static final String EMPLOYEE_ID_NOT_BLANK = "ID Employee tidak boleh kosong";

    /** Format employeeId bukan UUID valid */
    public static final String EMPLOYEE_ID_INVALID   =
            "Format ID Employee tidak valid. Harus berupa UUID";

    // =============================================
    // PESAN VALIDASI — MAGIC TOKEN
    // =============================================
    public static final String TOKEN_NOT_BLANK = "Token tidak boleh kosong";
    public static final String TOKEN_INVALID   = "Format token tidak valid";

    // =============================================
    // PESAN VALIDASI — UMUM
    // =============================================
    public static final String VALIDATION_FAILED = "Validasi input gagal";
}
