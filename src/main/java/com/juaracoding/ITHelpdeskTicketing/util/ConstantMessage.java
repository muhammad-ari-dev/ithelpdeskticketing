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
    public static final String SUCCESS_SAVE   = "Berhasil menyimpan data";
    public static final String SUCCESS_DELETE = "Berhasil menghapus data";
    public static final String SUCCESS_UPDATE = "Berhasil mengubah data";
    public static final String OK             = "OK";
    public static final String SUCCESS_UPLOAD = "Upload Berhasil";
    public static final String SUCCESS_REGIS  = "Registrasi Berhasil";
    public static final String SUCCESS_LOGIN  = "Login Berhasil";

    // =============================================
    // PESAN GAGAL UMUM
    // =============================================
    public static final String FAILED_SAVE   = "Gagal menyimpan data";
    public static final String FAILED_UPDATE = "Gagal mengubah data";
    public static final String FAILED_DELETE = "Gagal menghapus data";
    public static final String NOT_FOUND     = "Data tidak ditemukan";
    public static final String MUST_EXCEL    = "Format File Harus Excel";

    // =============================================
    // PESAN AUTH
    // =============================================
    public static final String FAILED_REGIS       = "Registrasi Gagal";
    public static final String USER_PWD_SALAH     = "Username atau Password Salah";
    public static final String OTP_SALAH          = "OTP Salah";
    public static final String USER_NOT_FOUND     = "User Tidak Ditemukan";
    public static final String ERROR_AUTH         = "Otentikasi Bermasalah";
    public static final String ACCOUNT_NOT_ACTIVE = "Akun Belum Aktif";

    // =============================================
    // PESAN VALIDASI — USERNAME
    // =============================================

    /** Field userName kosong atau null */
    public static final String USERNAME_NOT_BLANK = "Username tidak boleh kosong";

    /** Panjang username di luar batas 3-64 karakter */
    public static final String USERNAME_SIZE = "Username harus antara 3 hingga 64 karakter";

    /**
     * Format username tidak sesuai.
     * Regex: ^[a-zA-Z0-9._]{3,64}$
     * Hanya boleh: huruf, angka, titik (.), underscore (_)
     */
    public static final String USERNAME_INVALID =
            "Username hanya boleh mengandung huruf, angka, titik (.), dan underscore (_)";

    // =============================================
    // PESAN VALIDASI — PASSWORD
    // =============================================

    /** Field password kosong atau null */
    public static final String PASSWORD_NOT_BLANK = "Password tidak boleh kosong";

    /** Panjang password di luar batas 8-128 karakter */
    public static final String PASSWORD_SIZE = "Password harus antara 8 hingga 128 karakter";

    /** Password mengandung spasi */
    public static final String PASSWORD_NO_SPACE = "Password tidak boleh mengandung spasi";

    /**
     * Format password tidak memenuhi syarat kekuatan.
     * Aturan:
     *   - Minimal 1 huruf kecil
     *   - Minimal 1 huruf besar
     *   - Minimal 1 angka
     *   - Panjang 8-128 karakter
     *   - Simbol diperbolehkan tapi tidak diwajibkan
     */
    public static final String PASSWORD_INVALID =
            "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka";

    /** Field confirmPassword kosong */
    public static final String CONFIRM_PASSWORD_NOT_BLANK = "Konfirmasi password tidak boleh kosong";

    // =============================================
    // PESAN VALIDASI — NAMA
    // =============================================

    /** Field employeeName kosong */
    public static final String NAME_NOT_BLANK = "Nama tidak boleh kosong";

    /** Panjang nama di luar batas 2-64 karakter */
    public static final String NAME_SIZE = "Nama harus antara 2 hingga 64 karakter";

    /**
     * Format nama tidak valid.
     * Hanya boleh: huruf, spasi, titik (.), apostrof ('), strip (-)
     */
    public static final String NAME_INVALID =
            "Nama hanya boleh mengandung huruf, spasi, titik (.), apostrof ('), dan strip (-)";

    // =============================================
    // PESAN VALIDASI — EMAIL
    // =============================================

    /** Field email kosong */
    public static final String EMAIL_NOT_BLANK = "Email tidak boleh kosong";

    /** Format email tidak valid */
    public static final String EMAIL_INVALID =
            "Format email tidak valid (contoh: nama@domain.com)";

    // =============================================
    // PESAN VALIDASI — NO HP
    // =============================================

    /** Field noHp kosong */
    public static final String PHONE_NOT_BLANK = "Nomor HP tidak boleh kosong";

    /**
     * Format nomor HP tidak valid.
     * Regex: ^(\+62|62|0)[0-9]{8,13}$
     * Contoh VALID: 081234567890, +6281234567890
     */
    public static final String PHONE_INVALID =
            "Format nomor HP tidak valid. Gunakan format Indonesia (contoh: 081234567890 atau +6281234567890)";

    // =============================================
    // PESAN VALIDASI — ROLE
    // =============================================

    /** Field roleName kosong */
    public static final String ROLE_NOT_BLANK = "Role tidak boleh kosong";

    /**
     * roleName bukan salah satu nilai yang diizinkan.
     * Nilai valid: ADMINISTRATOR, LEAD, EMPLOYEE
     */
    public static final String ROLE_INVALID =
            "Role tidak valid. Pilihan yang tersedia: ADMINISTRATOR, LEAD, EMPLOYEE";

    // =============================================
    // PESAN VALIDASI — LEAD ID
    // =============================================

    /**
     * leadID diisi tapi formatnya bukan UUID valid.
     * Format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     */
    public static final String LEAD_ID_INVALID =
            "Format Lead ID tidak valid. Harus berupa UUID (contoh: 123e4567-e89b-12d3-a456-426614174000)";

    // =============================================
    // PESAN VALIDASI — MAGIC TOKEN
    // =============================================

    /** Magic token tidak dikirim */
    public static final String TOKEN_NOT_BLANK = "Token tidak boleh kosong";

    /**
     * Format magic token bukan UUID valid.
     * Token dibuat dari UUID.randomUUID().toString() di AuthService.
     */
    public static final String TOKEN_INVALID = "Format token tidak valid";

    // =============================================
    // PESAN VALIDASI — UMUM
    // =============================================

    /**
     * Pesan wrapper saat ada banyak error validasi sekaligus.
     * Dipakai di GlobalExceptionHandler.
     */
    public static final String VALIDATION_FAILED = "Validasi input gagal";
}
