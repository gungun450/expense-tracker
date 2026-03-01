package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserService implements UserDetailsService {
    @Autowired
    AuthRepository authRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = authRepository.FindByEmail(email);

        if(user == null)  return null;

        return  org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswords())
                .roles("USER")
                .disabled(user.getActive_yn()==0)
                .build();

    }


}
