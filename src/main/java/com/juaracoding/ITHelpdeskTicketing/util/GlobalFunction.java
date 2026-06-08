package com.juaracoding.ITHelpdeskTicketing.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

public class GlobalFunction {

    public static final String AUTH_HEADERS = "Authorization";
//    public static final String AUTH_HEADERS = "Jwt";

    /** filter pencarian untuk string */
    public static Boolean checkFilter(String s){
        return s!=null && !s.isEmpty() && !s.isBlank() && regexText(s);
    }
    public static Boolean checkFilter(Object o){
        return o!=null;
    }
    /** hanya mengijinkan pencarian alfanumerik titik koma dan spasi yang umum saja */
    public static Boolean regexText(String o){
        return o.matches("^[\\w\\.,\\s]{1,}$");
    }

    public static void manualResponse(HttpServletResponse response, ResponseEntity<Object> resObject){
        try{
            response.getWriter().write(convertObjectToJson(resObject.getBody()));
            response.setStatus(resObject.getStatusCode().value());
            response.setContentType("application/json");
        }catch (Exception e){
        }
    }
    public static String convertObjectToJson(Object object) throws JsonProcessingException {
        if(object == null){
            return null;
        }
        JsonMapper mapper = new JsonMapper();
        return mapper.writeValueAsString(object);
    }
}
