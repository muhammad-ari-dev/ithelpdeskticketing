package com.juaracoding.ITHelpdeskTicketing.dto;

import lombok.Data;

@Data
public class SetPasswordRequest {
    private String token;
    private String newPassword;
}