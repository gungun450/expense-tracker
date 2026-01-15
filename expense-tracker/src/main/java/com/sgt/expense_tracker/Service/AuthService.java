package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import com.sgt.expense_tracker.exception.EmailAlreadyExistsException;
import com.sgt.expense_tracker.exception.InvalidEmailException;
import com.sgt.expense_tracker.exception.UserNameAlreadyExistException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AuthService {
    @Autowired
    AuthRepository authRepository;



    public void register(User user) throws InvalidEmailException,EmailAlreadyExistsException,
            UserNameAlreadyExistException {
        if(!isEmailValid(user.getEmail())) {
            throw new InvalidEmailException();
        }
        if(authRepository.FindByUsername(user.getUsername())!=null){
            throw new UserNameAlreadyExistException();
        }
        if(authRepository.FindByEmail(user.getEmail())!=null) {
            throw new EmailAlreadyExistsException();
        }
        String EncodedPassword = encodePassword(user.getPasswords());

        authRepository.addUser(user.getName(),
                user.getUsername(),
                user.getEmail(),
                EncodedPassword,
                user.getPhoneNumber());

        // check if email already exists -- FindByEmail
        // check if username already exists -- FindByUserName
        //hash passwords
        // if all passed then call repository
        // try catch handle in controller level
    }

    private boolean isEmailValid(String email){
        if(email == null )    return false;

        String REGEX = "^[A-Za-z0-9_+.-]+@[A-Za-z0-9_+.-]+\\.[a-z]{2,}$";
        Pattern pattern = Pattern.compile(REGEX);
        Matcher matcher = pattern.matcher(email);

        return matcher.matches();
    }

     private String encodePassword(String Password){
         BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
         return bCryptPasswordEncoder.encode(Password);
    }

    // forget password
    public void forgetPassword(String email){
        User user = authRepository.FindByEmail(email);
        if(user == null) {
            return;
        }
    }
}
