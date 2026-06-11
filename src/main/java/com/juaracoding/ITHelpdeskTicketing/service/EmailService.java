package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.config.OtherConfig;
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
        String url = OtherConfig.getBaseMailUrl() + "/set-password?token=" + token;
//        String html = """
//                 <!DOCTYPE html>\n" +
//                "<html lang=\"id\">\n" +
//                "<head>\n" +
//                "    <meta charset=\"UTF-8\">\n" +
//                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
//                "    <title>Set Password Akun Baru</title>\n" +
//                "    <style>\n" +
//                "        body {\n" +
//                "            font-family: Arial, sans-serif;\n" +
//                "            background-color: #f4f4f5;\n" +
//                "            margin: 0;\n" +
//                "            padding: 0;\n" +
//                "            -webkit-font-smoothing: antialiased;\n" +
//                "        }\n" +
//                "        .email-container {\n" +
//                "            max-width: 600px;\n" +
//                "            margin: 20px auto;\n" +
//                "            background-color: #ffffff;\n" +
//                "            padding: 30px;\n" +
//                "            border-radius: 8px;\n" +
//                "            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);\n" +
//                "        }\n" +
//                "        .text-content {\n" +
//                "            font-size: 16px;\n" +
//                "            color: #333333;\n" +
//                "            line-height: 1.6;\n" +
//                "        }\n" +
//                "        .button-container {\n" +
//                "            text-align: center;\n" +
//                "            margin: 30px 0;\n" +
//                "        }\n" +
//                "        .btn-primary {\n" +
//                "            display: inline-block;\n" +
//                "            background-color: #007bff;\n" +
//                "            color: #ffffff !important;\n" +
//                "            text-decoration: none;\n" +
//                "            padding: 12px 24px;\n" +
//                "            font-size: 16px;\n" +
//                "            font-weight: bold;\n" +
//                "            border-radius: 5px;\n" +
//                "            box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);\n" +
//                "        }\n" +
//                "        .btn-primary:hover {\n" +
//                "            background-color: #0056b3;\n" +
//                "        }\n" +
//                "        .footer {\n" +
//                "            margin-top: 30px;\n" +
//                "            border-top: 1px solid #e4e4e7;\n" +
//                "            padding-top: 20px;\n" +
//                "            font-size: 14px;\n" +
//                "            color: #666666;\n" +
//                "        }\n" +
//                "    </style>\n" +
//                "</head>\n" +
//                "<body>\n" +
//                "\n" +
//                "    <div class=\"email-container\">\n" +
//                "        <div class=\"text-content\">\n" +
//                "            <p>Halo,</p>\n" +
//                "            <p>Admin telah mendaftarkan akun Anda sebagai <strong>Lead</strong>. Silakan klik tombol di bawah ini untuk membuat password Anda:</p>\n" +
//                "        </div>\n" +
//                "\n" +
//                "        <div class=\"button-container\">\n" +
//                "            <!-- Link URL diubah menjadi Button -->\n" +
//                "            <a href=\"%s\" class=\"btn-primary\" target=\"_blank\">Buat Password</a>\n" +
//                "        </div>\n" +
//                "\n" +
//                "        <div class=\"footer\">\n" +
//                "            <p>Terima kasih.</p>\n" +
//                "        </div>\n" +
//                "    </div>\n" +
//                "\n" +
//                "</body>\n" +
//                "</html> """;
//        message.setText(String.format(html, url));

        message.setText("Halo,\n\nAdmin telah mendaftarkan akun Anda sebagai Lead. " +
                "Silakan klik link di bawah ini untuk membuat password Anda:\n\n" +
                url + "\n\nTerima kasih.");

        mailSender.send(message);
    }
}