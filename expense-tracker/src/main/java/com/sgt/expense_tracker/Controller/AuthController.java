package com.sgt.expense_tracker.Controller;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Service.AuthService;
import com.sgt.expense_tracker.exception.EmailAlreadyExistsException;
import com.sgt.expense_tracker.exception.InvalidEmailException;
import com.sgt.expense_tracker.exception.InvalidTokenException;
import com.sgt.expense_tracker.exception.UserNameAlreadyExistException;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {
         Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthService authservice;

    @PostMapping("/register")
    public ResponseEntity<Map<String,String>> register(@RequestBody User user){
        try{
            authservice.register(user);
            return ResponseEntity.ok().body(Map.of("body","User Successfully Registered!!"));
        }catch(InvalidEmailException | UserNameAlreadyExistException |EmailAlreadyExistsException e) {
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }

    }
    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody  User user){
        try{
            authservice.login(user);
            return ResponseEntity.ok().body(Map.of("body","Login successfully"));
        } catch (InvalidEmailException e) {
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }

    }
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String,String>> forgotPassword(@RequestBody User user){
        try {
            authservice.forgotPassword(user);
            logger.info("Email sent");
            return ResponseEntity.ok().body(Map.of("body","Mail sent successfully"));
        }  catch (InvalidEmailException | MessagingException e) {
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }
    }
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String,String>> resetPassword(@RequestBody Map<String, String> request){
        try{
             String token = request.get("token");
             String newPassword = request.get("newPassword");
            authservice.resetPassword(token,newPassword);
            logger.info("Updated Password");
            return ResponseEntity.ok().body(Map.of("body","Password updated successfully"));
        }catch(InvalidTokenException e){
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }
    }

}
