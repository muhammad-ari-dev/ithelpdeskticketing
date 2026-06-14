package com.juaracoding.ITHelpdeskTicketing.dto.validation;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisDTO {

    /**
     * VALIDASI NAMA LENGKAP
     *
     * Regex: ^[a-zA-Z\s.'-]{2,64}$
     *   [a-zA-Z] : huruf A-Z dan a-z
     *   \s       : spasi (untuk nama dengan 2 kata, misal "John Doe")
     *   .'-      : titik, apostrof, dan strip (untuk nama seperti "O'Brien", "Mary-Jane")
     *   {2,64}   : panjang antara 2–64 karakter
     *
     *   Contoh VALID   : John Doe, Mary-Jane, O'Brien, Dr. Smith
     *   Contoh INVALID : John123 (ada angka), <script> (ada karakter berbahaya)
     */
    @NotBlank(message = ConstantMessage.NAME_NOT_BLANK)
    @Size(min = 2, max = 64, message = ConstantMessage.NAME_SIZE)
    @Pattern(
        regexp = "^[a-zA-Z\\s.'\\-]{2,64}$",
        message = ConstantMessage.NAME_INVALID
    )
    private String employeeName;

    /**
     * VALIDASI USERNAME
     *
     * Regex: ^[a-zA-Z0-9._]{3,64}$
     *   Hanya boleh: huruf, angka, titik (.), underscore (_)
     *   Tidak boleh: spasi, @, #, !, dll
     *
     *   Contoh VALID   : john.doe, admin_01, JohnDoe
     *   Contoh INVALID : john doe, john@doe, ab
     */
    @NotBlank(message = ConstantMessage.USERNAME_NOT_BLANK)
    @Size(min = 3, max = 64, message = ConstantMessage.USERNAME_SIZE)
    @Pattern(
        regexp = "^[a-zA-Z0-9._]{3,64}$",
        message = ConstantMessage.USERNAME_INVALID
    )
    private String userName;

    /**
     * VALIDASI EMAIL
     *
     * @Email     → Anotasi bawaan Spring Validation untuk format email standar.
     *              Lebih reliable daripada bikin regex email sendiri karena
     *              RFC 5322 (standar email) sangat kompleks.
     *              Contoh VALID   : user@example.com, nama.baru@perusahaan.co.id
     *              Contoh INVALID : user@, @domain.com, tidakadaat
     *
     * @Pattern sebagai lapisan kedua → Tolak domain yang tidak wajar.
     *   Regex: ^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$
     *   Memastikan domain TLD minimal 2 huruf (misal .com, .id, .co.id)
     */
    @NotBlank(message = ConstantMessage.EMAIL_NOT_BLANK)
    @Email(message = ConstantMessage.EMAIL_INVALID)
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
        message = ConstantMessage.EMAIL_INVALID
    )
    private String email;

    /**
     * VALIDASI NOMOR HP
     *
     * Regex: ^(\+62|62|0)[0-9]{8,13}$
     *   (\+62|62|0) : awalan nomor Indonesia — bisa +62, 62, atau 0
     *   [0-9]{8,13} : diikuti 8–13 digit angka
     *
     *   Total panjang maksimal: 3 (awalan) + 13 = 16 karakter → sesuai @Column length=20
     *
     *   Contoh VALID   : 081234567890, +6281234567890, 6281234567890
     *   Contoh INVALID : 12345 (terlalu pendek), +1234567890 (bukan awalan Indonesia)
     */
    @NotBlank(message = ConstantMessage.PHONE_NOT_BLANK)
    @Pattern(
        regexp = "^(\\+62|62|0)[0-9]{8,13}$",
        message = ConstantMessage.PHONE_INVALID
    )
    private String noHp;

    /**
     * VALIDASI ROLE NAME
     *
     * Regex: ^(ADMINISTRATOR|LEAD|EMPLOYEE)$
     *   Hanya menerima tepat 3 nilai yang terdefinisi (enum-like validation).
     *   Ini mencegah user menginput role sembarangan yang tidak ada di DB.
     *
     *   Contoh VALID   : ADMINISTRATOR, LEAD, EMPLOYEE
     *   Contoh INVALID : admin, superuser, OWNER
     *
     *   CATATAN: Jika kamu nambah role baru di DB, tambahkan juga di sini.
     */
    @NotBlank(message = ConstantMessage.ROLE_NOT_BLANK)
    @Pattern(
        regexp = "^(ADMINISTRATOR|LEAD|EMPLOYEE)$",
        message = ConstantMessage.ROLE_INVALID
    )
    private String roleName;

    /**
     * VALIDASI LEAD ID (Opsional)
     *
     * Format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     * Regex: ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$
     *
     *   [0-9a-fA-F] : karakter hexadecimal (0-9 dan a-f)
     *   {8}-{4}-{4}-{4}-{12} : format blok UUID standar
     *
     * MENGAPA TIDAK @NotBlank?
     * → Karena leadID boleh kosong/null (untuk role LEAD atau ADMINISTRATOR).
     *   Validasi wajib-tidaknya lead sudah dihandle di AuthService.registerEmployee().
     *
     * CATATAN: @Pattern otomatis skip (tidak error) jika nilai null atau kosong "".
     *   Jadi aman untuk field opsional.
     */
    @Pattern(
        regexp = "^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = ConstantMessage.LEAD_ID_INVALID
    )
    private String leadID;
}
