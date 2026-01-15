package com.sgt.expense_tracker.Controller;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Service.AuthService;
import com.sgt.expense_tracker.exception.EmailAlreadyExistsException;
import com.sgt.expense_tracker.exception.InvalidEmailException;
import com.sgt.expense_tracker.exception.UserNameAlreadyExistException;
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
//    @PostMapping("/forget-passowrd")
//    public ResponseEntity<String> forgetPassword(){
//
//    }
}
