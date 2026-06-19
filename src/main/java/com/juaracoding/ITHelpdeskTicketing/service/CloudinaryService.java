package com.juaracoding.ITHelpdeskTicketing.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.juaracoding.ITHelpdeskTicketing.config.CloudinaryConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    public String uploadFile(MultipartFile file) {
        try {
            // 1. Setup objek Cloudinary langsung di sini pakai Static Getter dari Config lu!
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", CloudinaryConfig.getCloudName(),
                    "api_key", CloudinaryConfig.getApiKey(),
                    "api_secret", CloudinaryConfig.getApiSecret()
            ));

            // 2. Upload file ke Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

            // 3. Return URL HTTPS (Secure URL) dari Cloudinary
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Gagal mengupload file ke Cloudinary: " + e.getMessage());
        }
    }
}