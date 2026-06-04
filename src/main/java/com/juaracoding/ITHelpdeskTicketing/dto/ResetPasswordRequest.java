package com.juaracoding.ITHelpdeskTicketing.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String otpCode;
    private String newPassword;
}