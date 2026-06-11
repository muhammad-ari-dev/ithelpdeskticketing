package com.juaracoding.ITHelpdeskTicketing.handler;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GLOBAL EXCEPTION HANDLER
 *
 * @RestControllerAdvice → Penggabungan @ControllerAdvice + @ResponseBody.
 *   Artinya: class ini adalah "petugas penjaga" yang menangkap Exception
 *   dari SEMUA controller secara global, dan response-nya otomatis
 *   dikonversi ke JSON.
 *
 * TANPA class ini:
 *   → Saat @Valid gagal, Spring akan return response HTML error default
 *     yang tidak rapi dan tidak konsisten dengan format ResponseHandler.
 *
 * DENGAN class ini:
 *   → Semua error validasi ditangkap dan diformat menjadi JSON yang rapi
 *     dan konsisten.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * HANDLER: MethodArgumentNotValidException
     *
     * Exception ini otomatis dilempar Spring ketika @Valid gagal
     * (ada field yang tidak lolos validasi @NotBlank, @Pattern, @Size, @Email, dll).
     *
     * ALUR:
     *   1. Request masuk ke controller
     *   2. @Valid dijalankan → ada field yang gagal
     *   3. Spring lempar MethodArgumentNotValidException
     *   4. Method ini menangkapnya (@ExceptionHandler)
     *   5. Kita ekstrak semua error field → return JSON rapi ke client
     *
     * @param ex      : Exception yang berisi detail semua field yang gagal
     * @param request : HTTP Request (untuk info URL, dsb)
     * @return        : ResponseEntity dengan format JSON yang konsisten
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        /**
         * LANGKAH 1: Kumpulkan semua error per field
         *
         * ex.getBindingResult().getAllErrors() → List semua error validasi
         * Setiap error adalah FieldError yang berisi:
         *   - getField()          : nama field yang gagal (misal: "email", "password")
         *   - getDefaultMessage() : pesan error dari anotasi (misal: ConstantMessage.EMAIL_INVALID)
         *
         * Contoh result:
         * {
         *   "email": "Format email tidak valid",
         *   "password": "Password tidak boleh kosong"
         * }
         */
        Map<String, String> errors = new LinkedHashMap<>();
        // LinkedHashMap dipilih agar urutan error sesuai urutan field di DTO

        ex.getBindingResult().getAllErrors().forEach(error -> {
            // Cast ke FieldError untuk mendapat nama field
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        /**
         * LANGKAH 2: Bungkus dalam format response yang konsisten
         *
         * Format ini konsisten dengan ResponseHandler yang sudah ada di project,
         * sehingga frontend tidak perlu handle format berbeda.
         */
        Map<String, Object> response = new HashMap<>();
        response.put("message", ConstantMessage.VALIDATION_FAILED);  // pesan utama
        response.put("status", HttpStatus.BAD_REQUEST.value());       // 400
        response.put("errors", errors);                               // detail error per field
        response.put("timestamp", LocalDateTime.now().toString());    // waktu error
        response.put("success", false);                               // indikator gagal
        response.put("path", request.getRequestURI());                // endpoint yang dipanggil

        /**
         * Return HTTP 400 Bad Request
         *
         * 400 adalah kode yang tepat untuk validation error karena
         * ini adalah kesalahan dari sisi client (input tidak valid),
         * bukan kesalahan server.
         */
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * HANDLER: Exception Umum (Catch-All / Fallback)
     *
     * Menangkap semua exception yang tidak ditangani handler spesifik di atas.
     * Ini adalah "jaring pengaman" terakhir agar server tidak pernah
     * return response error HTML yang tidak rapi.
     *
     * Contoh kasus: NullPointerException, RuntimeException tak terduga, dll.
     *
     * CATATAN: Handler ini hanya untuk error yang TIDAK terduga.
     * Error bisnis logic (misal: "Username sudah dipakai") tetap dihandle
     * masing-masing di controller dengan try-catch.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(
            Exception ex,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Terjadi kesalahan pada server: " + ex.getMessage());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value()); // 500
        response.put("errors", null);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("success", false);
        response.put("path", request.getRequestURI());

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
