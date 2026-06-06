package com.juaracoding.ITHelpdeskTicketing.dto;

import lombok.Data;

@Data
public class SetPasswordDTO {
    private String magicToken;
    private String newPassword;
    private String confirmPassword;
}