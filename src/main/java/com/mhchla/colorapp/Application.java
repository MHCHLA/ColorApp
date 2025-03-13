package com.mhchla.colorapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan("com.mhchla.colorapp")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
