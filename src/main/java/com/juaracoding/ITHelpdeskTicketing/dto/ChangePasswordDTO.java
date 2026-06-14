package com.juaracoding.ITHelpdeskTicketing.dto;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDTO {

    /**
     * PASSWORD LAMA
     *
     * Dipakai untuk verifikasi bahwa yang request ganti password
     * adalah pemilik akun yang sah (bukan orang lain yang curi session).
     *
     * Validasi sama seperti login — tidak perlu strict karena
     * ini input dari user yang sudah tahu passwordnya sendiri.
     */
    @NotBlank(message = ConstantMessage.OLD_PASSWORD_NOT_BLANK)
    @Size(min = 8, max = 128, message = ConstantMessage.PASSWORD_SIZE)
    private String oldPassword;

    /**
     * PASSWORD BARU
     *
     * Aturan:
     *   (?=.*[a-z]) : minimal 1 huruf kecil
     *   (?=.*[A-Z]) : minimal 1 huruf besar
     *   (?=.*\d)    : minimal 1 angka
     *   {8,128}     : panjang 8-128 karakter
     *   Simbol boleh tapi tidak diwajibkan
     *
     * Contoh VALID   : Admin123, NewPass99
     * Contoh INVALID : password (tidak ada huruf besar & angka)
     */
    @NotBlank(message = ConstantMessage.PASSWORD_NOT_BLANK)
    @Size(min = 8, max = 128, message = ConstantMessage.PASSWORD_SIZE)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&._\\-]{8,128}$",
        message = ConstantMessage.PASSWORD_INVALID
    )
    private String newPassword;

    /**
     * KONFIRMASI PASSWORD BARU
     *
     * Regex sama dengan newPassword.
     * Pengecekan kesamaan newPassword == confirmPassword
     * tetap dilakukan di service layer.
     */
    @NotBlank(message = ConstantMessage.CONFIRM_PASSWORD_NOT_BLANK)
    @Size(min = 8, max = 128, message = ConstantMessage.PASSWORD_SIZE)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&._\\-]{8,128}$",
        message = ConstantMessage.PASSWORD_INVALID
    )
    private String confirmPassword;
}
