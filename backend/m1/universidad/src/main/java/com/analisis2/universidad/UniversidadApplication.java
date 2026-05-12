package com.analisis2.universidad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UniversidadApplication {

	public static void main(String[] args) {
		SpringApplication.run(UniversidadApplication.class, args);
	}

}
