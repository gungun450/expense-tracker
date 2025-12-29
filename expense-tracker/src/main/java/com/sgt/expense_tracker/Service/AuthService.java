package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    AuthRepository AuthRepository;

    public void register(User user){
        // check validity
        // check if email already exists -- FindByEmail
        // check if username already exists -- FindByUserName
        //hash passwords
        // if all passed then call repository
        // try catch handle in controller level
    }
}
