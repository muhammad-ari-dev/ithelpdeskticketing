package com.juaracoding.ITHelpdeskTicketing.dto.validation;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginDTO {

    /**
     * VALIDASI USERNAME
     *
     * Regex: ^[a-zA-Z0-9._]{3,64}$
     *   [a-zA-Z0-9._] : hanya huruf, angka, titik, underscore
     *   {3,64}        : panjang 3-64 karakter
     *
     * Contoh VALID   : john.doe, admin_123, JohnDoe99
     * Contoh INVALID : john doe (ada spasi), jo (kurang dari 3 karakter)
     */
    @NotBlank(message = ConstantMessage.USERNAME_NOT_BLANK)
    @Size(min = 3, max = 64, message = ConstantMessage.USERNAME_SIZE)
    @Pattern(
        regexp = "^[a-zA-Z0-9._]{3,64}$",
        message = ConstantMessage.USERNAME_INVALID
    )
    private String userName;

    /**
     * VALIDASI PASSWORD SAAT LOGIN
     *
     * Aturan password (sama dengan set-password, tanpa wajib simbol):
     *   (?=.*[a-z])  : minimal 1 huruf kecil
     *   (?=.*[A-Z])  : minimal 1 huruf besar
     *   (?=.*\d)     : minimal 1 angka
     *   {8,128}      : panjang 8-128 karakter
     *
     * MENGAPA DISAMAKAN DENGAN SET-PASSWORD?
     * Prinsip "Defense in Depth" — pertahanan berlapis.
     * Meskipun password sudah divalidasi saat set-password,
     * validasi di login tetap dipasang untuk keamanan ekstra.
     *
     * Contoh VALID   : Admin123, Password1, MyPass99
     * Contoh INVALID : password123 (tidak ada huruf besar)
     *                  ADMIN123    (tidak ada huruf kecil)
     */
    @NotBlank(message = ConstantMessage.PASSWORD_NOT_BLANK)
    @Size(min = 8, max = 128, message = ConstantMessage.PASSWORD_SIZE)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&._\\-]{8,128}$",
        message = ConstantMessage.PASSWORD_INVALID
    )
    private String password;
}
