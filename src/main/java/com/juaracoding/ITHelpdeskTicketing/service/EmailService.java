package com.juaracoding.ITHelpdeskTicketing.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

//    public void kirimEmailTes(String toEmail) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setFrom("admin@helpdeskku.com"); // Bebas, ini cuma identitas
//        message.setTo(toEmail);
//        message.setSubject("Tes Koneksi Mailtrap");
//        message.setText("Halo cuy! Kalau email ini nyampe, berarti setup lu SUKSES 100%! Backend lu udah jago kirim email.");
//
//        mailSender.send(message);
//        System.out.println("Email sukses terkirim ke: " + toEmail);
//    }

    // Tambahin method ini di bawah method kirimEmailTes lu
    public void sendMagicLink(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("admin@helpdeskku.com"); // Email pengirim
        message.setTo(toEmail);
        message.setSubject("Undangan Setup Akun Lead - ITHelpdesk");

        // Ini link yang nanti bakal diklik si Lead buat isi password
        // 5173 itu default port React/Vite
        String url = "http://localhost:5173/set-password?token=" + token;

        message.setText("Halo,\n\nAdmin telah mendaftarkan akun Anda sebagai Lead. " +
                "Silakan klik link di bawah ini untuk membuat password Anda:\n\n" +
                url + "\n\nTerima kasih.");

        mailSender.send(message);
    }
}