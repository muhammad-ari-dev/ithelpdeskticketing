package com.juaracoding.ITHelpdeskTicketing.handler;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/** Response Body untuk masalah Bisnis Logic dan Status Berhasil */
public class ResponseHandler {

    public ResponseEntity<Object> handleResponse(
            String message,//pesan yang akan di display ke user
            HttpStatus status,// memiliki 2 informasi teknis , kode dan pesan teknikal
            Object data,// data yang diminta sesuai request
            HttpServletRequest request
    ){

        Map<String,Object> m = new HashMap<>();
        m.put("message",message);
        m.put("status",status.value());
        m.put("data",data==null?"":data);
        m.put("timestamp", LocalDateTime.now().toString());
        m.put("success",!status.isError());
        return new ResponseEntity<>(m,status);
    }

    public ResponseEntity<Object> handleResponse(
            String message,
            HttpStatus status,
            Object data,
            WebRequest request
    ){

        Map<String,Object> m = new HashMap<>();
        m.put("message",message);
        m.put("status",status.value());
        m.put("data",data==null?"":data);
        m.put("timestamp", LocalDateTime.now().toString());
        m.put("success",!status.isError());
        return new ResponseEntity<>(m,status);
    }
}