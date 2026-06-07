package com.juaracoding.ITHelpdeskTicketing.security;

import com.juaracoding.ITHelpdeskTicketing.config.JwtConfig;
import com.juaracoding.ITHelpdeskTicketing.service.AuthService;
import com.juaracoding.ITHelpdeskTicketing.util.GlobalFunction;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

//import org.springframework.session.Session;
//import org.springframework.session.FindByIndexNameSessionRepository;

@Component
public class JwtFilter extends OncePerRequestFilter {


//    @Autowired
//    private FindByIndexNameSessionRepository<? extends Session> sessionRepository;

    @Autowired
    private JwtUtility jwtUtility;

    @Autowired
    private AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader(GlobalFunction.AUTH_HEADERS);//JWT / Authorization
        authorization = authorization == null ? "" : authorization;
        String token = "";
        String username = "";
        try{
            if(!"".equals(authorization) &&
                    authorization.startsWith("Bearer ") &&
                    authorization.length() > 7){
                token = authorization.substring(7);

                if(JwtConfig.getTokenEncryptEnable().equals("y")){
                    token = CryptoJwt.performDecrypt(token);
                }
                username = jwtUtility.getUsernameFromToken(token);
                String strContentType = request.getContentType()==null?"":request.getContentType();
            if(!strContentType.startsWith("multipart/form-data") || "".equals(strContentType)){
                request = new MyHttpServletRequestWrapper(request);
            }
            if(username != null && SecurityContextHolder.getContext().getAuthentication()==null){
                if(jwtUtility.validateToken(token)){
//                    Session session = sessionRepository.findById(token);
//                    if (session != null && !session.isExpired()) {
                        UserDetails userDetails = authService.loadUserByUsername(username);
                        /** persiapan konteks permission / izin / hak ases nya saat di dorong ke controller nantinya */
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
//                    }
                }
            }
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        filterChain.doFilter(request, response);
    }
}