package com.juaracoding.ITHelpdeskTicketing.dto.validation;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateEmployeeDTO {

    @NotBlank(message = ConstantMessage.EMPLOYEE_ID_NOT_BLANK)
    @Pattern(
            regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
            message = ConstantMessage.EMPLOYEE_ID_INVALID
    )
    private String employeeId;
    @NotBlank(message = ConstantMessage.NAME_NOT_BLANK)
    @Size(min = 2, max = 64, message = ConstantMessage.NAME_SIZE)
    @Pattern(
            regexp = "^[a-zA-Z\\s.'\\-]{2,64}$",
            message = ConstantMessage.NAME_INVALID
    )
    private String employeeName;

    @NotBlank(message = ConstantMessage.EMAIL_NOT_BLANK)
    @Email(message = ConstantMessage.EMAIL_INVALID)
    @Pattern(
            regexp = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
            message = ConstantMessage.EMAIL_INVALID
    )
    private String email;

    @NotBlank(message = ConstantMessage.PHONE_NOT_BLANK)
    @Pattern(
            regexp = "^(\\+62|62|0)[0-9]{8,13}$",
            message = ConstantMessage.PHONE_INVALID
    )
    private String noHp;

    @NotBlank(message = ConstantMessage.ROLE_NOT_BLANK)
    @Pattern(
            regexp = "^(ADMINISTRATOR|LEAD|EMPLOYEE)$",
            message = ConstantMessage.ROLE_INVALID
    )
    private String roleName;

    @Pattern(
            regexp = "^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
            message = ConstantMessage.LEAD_ID_INVALID
    )
    private String leadID;

    private List<String> staffIds;
}


