package com.juaracoding.ITHelpdeskTicketing.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // FUNGSI 1: Kirim Email Magic Link
    public void sendMagicLink(String toEmail, String employeeName, String magicToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Aktivasi Akun IT Helpdesk System");

        // Ganti port 5173 kalau Frontend lu pake Vite, atau 3000 kalau React biasa
        String link = "http://localhost:5173/set-password?token=" + magicToken;

        String body = "Yth. " + employeeName + ",\n\n" +
                "Akun Anda telah didaftarkan oleh Admin IT Helpdesk.\n" +
                "Silakan klik link di bawah ini untuk membuat password dan mengaktifkan akun Anda:\n\n" +
                link + "\n\n" +
                "Terima kasih,\n" +
                "Admin IT Helpdesk";

        message.setText(body);
        mailSender.send(message);
    }

    // FUNGSI 2: Kirim Email OTP (Buat Lupa Password)
    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Kode OTP Reset Password IT Helpdesk");

        String body = "Kode OTP Reset Password Anda adalah: " + otpCode + "\n\n" +
                "Kode ini akan kedaluwarsa dalam 10 menit.\n" +
                "Jika Anda tidak merasa meminta reset password, abaikan email ini.";

        message.setText(body);
        mailSender.send(message);
    }
}