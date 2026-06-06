package com.juaracoding.ITHelpdeskTicketing;

import com.juaracoding.ITHelpdeskTicketing.service.EmailService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ItHelpdeskTicketingApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItHelpdeskTicketingApplication.class, args);
	}
//	@Bean
//	public CommandLineRunner run(EmailService emailService) {
//		return args -> {
//			emailService.kirimEmailTes("email_tes_lu@mailinator.com");
//		};
//	}
}
