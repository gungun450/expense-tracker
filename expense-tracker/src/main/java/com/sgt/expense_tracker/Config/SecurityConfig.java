package com.sgt.expense_tracker.Config;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    AuthRepository authRepository;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                .cors(cors-> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf->csrf.disable())
            .authorizeHttpRequests(auth->auth
                .requestMatchers("/register","/login","/forget-password","/reset-password","/category","/transaction").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form->form
                .loginProcessingUrl("/login")
                .usernameParameter("email")
                .successHandler((req, res, auth) -> {
                    String email = auth.getName();
                    User user = authRepository.FindByEmail(email);

                    res.setStatus(HttpServletResponse.SC_OK);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"message\": \"Login Successful\", \"user\" : \"" + auth.getName() + "\", \"uid\": " + user.getId() + "}");
                })
                .failureHandler((req, res, ex) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"error\" :\"Invalid Credentials\" }");
                })
            )
            .exceptionHandling(ex->ex
                .authenticationEntryPoint((req,res,ex2)->{
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.getWriter().write("{\n" +
                            " \"error\" : \"Please Login In\"\n" +
                            "}");
                })
            );
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173","http://localhost:5174"));

        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization","content-type","Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**",configuration);

        return source;
    }

}