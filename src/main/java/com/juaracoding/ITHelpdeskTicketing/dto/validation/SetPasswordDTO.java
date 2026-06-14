package com.juaracoding.ITHelpdeskTicketing.dto.validation;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SetPasswordDTO {

    /**
     * VALIDASI MAGIC TOKEN
     *
     * Magic token dibuat dengan UUID.randomUUID().toString() di AuthService.
     * Format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     *
     * Regex UUID: ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$
     * Memastikan format token valid sebelum query ke DB.
     */
    @NotBlank(message = ConstantMessage.TOKEN_NOT_BLANK)
    @Pattern(
        regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = ConstantMessage.TOKEN_INVALID
    )
    private String magicToken;

    /**
     * VALIDASI PASSWORD BARU
     *
     * Aturan password (tanpa wajib simbol):
     *   (?=.*[a-z])       : minimal 1 huruf kecil
     *   (?=.*[A-Z])       : minimal 1 huruf besar
     *   (?=.*\d)          : minimal 1 angka
     *   [A-Za-z\d@$!%*?&._\-]{8,128} : karakter yang diizinkan, panjang 8-128
     *
     * Contoh VALID   : Admin123, Password1, MyPass99
     * Contoh INVALID : password  (tidak ada huruf besar & angka)
     *                  PASSWORD1 (tidak ada huruf kecil)
     *                  Admin     (tidak ada angka, kurang dari 8 karakter)
     *
     * MENGAPA MAKSIMAL 128?
     * BCrypt efektif sampai 72 karakter.
     * Batasi 128 untuk mencegah serangan DoS via password sangat panjang
     * yang memakan CPU saat proses hashing.
     */
    @NotBlank(message = ConstantMessage.PASSWORD_NOT_BLANK)
    @Size(min = 8, max = 128, message = ConstantMessage.PASSWORD_SIZE)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&._\\-]{8,128}$",
        message = ConstantMessage.PASSWORD_INVALID
    )
    private String newPassword;

    /**
     * VALIDASI KONFIRMASI PASSWORD
     *
     * Regex sama persis dengan newPassword.
     *
     * CATATAN: Pengecekan bahwa newPassword == confirmPassword
     * tetap dilakukan di AuthService.setPassword():
     *   if (!dto.getNewPassword().equals(dto.getConfirmPassword())) { ... }
     *
     * @Pattern di sini hanya memastikan format confirmPassword valid
     * sebelum sampai ke layer service.
     */
    @NotBlank(message = ConstantMessage.CONFIRM_PASSWORD_NOT_BLANK)
    @Size(min = 8, max = 128, message = ConstantMessage.PASSWORD_SIZE)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&._\\-]{8,128}$",
        message = ConstantMessage.PASSWORD_INVALID
    )
    private String confirmPassword;
}
