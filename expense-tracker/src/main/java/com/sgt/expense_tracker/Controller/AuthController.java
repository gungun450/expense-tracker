package com.sgt.expense_tracker.Controller;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Service.AuthService;
//import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {
    @Autowired
    AuthService Authservice;

    @PostMapping("/register")
    public ResponseEntity<Map<String,Object>> register(@RequestBody User user){

    }

}
