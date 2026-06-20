package com.juaracoding.ITHelpdeskTicketing.dto.response;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class EditEmployeeDTO {

    /**
     * ID employee yang akan di-disable, dikirim dalam format UUID.
     *
     * Regex UUID: ^[0-9a-fA-F]{8}-...-[0-9a-fA-F]{12}$
     * Memastikan format ID valid sebelum query ke DB.
     *
     * Contoh: "316ad258-51e6-45d9-a593-5d897164913e"
     */
    @NotBlank(message = ConstantMessage.EMPLOYEE_ID_NOT_BLANK)
    @Pattern(
        regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = ConstantMessage.EMPLOYEE_ID_INVALID
    )
    private String employeeId;
}
