package com.sgt.expense_tracker.Repository;

import com.sgt.expense_tracker.Model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public class AuthRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;
    Logger logger = LoggerFactory.getLogger(AuthRepository.class);

    public User FindByEmail(String email){
      String query = "select Uid,name,username,phoneNumber,email,passwords,active_yn from users where email = ? ";
     try {
         User user = jdbcTemplate.queryForObject(query,(resultset,rownum)->{
            User u = new User();
            u.setId(resultset.getInt("Uid"));
            u.setEmail(resultset.getString("email"));
            u.setName(resultset.getString("name"));
            u.setUsername(resultset.getString("username"));
            u.setPhoneNumber(resultset.getString("phoneNumber"));
            u.setPasswords(resultset.getString("passwords"));
            u.setActive_yn(resultset.getInt("active_yn"));
            return u;
         },email);
        return user;
    } catch (EmptyResultDataAccessException e) {
        return null;  // Return null when user not found
    }
}

   public User FindByUsername(String username){
    String query = "select Uid,name,username,phoneNumber,email,passwords,active_yn from users where username = ?";
    try {
        User user = jdbcTemplate.queryForObject(query,(resultset,rownum)->{
            User u = new User();
            u.setId(resultset.getInt("Uid"));
            u.setEmail(resultset.getString("email"));
            u.setName(resultset.getString("name"));
            u.setUsername(resultset.getString("username"));
            u.setPhoneNumber(resultset.getString("phoneNumber"));
            u.setPasswords(resultset.getString("passwords"));
            u.setActive_yn(resultset.getInt("active_yn"));
            return u;
        },username);
        return user;
    } catch (EmptyResultDataAccessException e) {
        return null;  // Return null when user not found
    }
}

    public void saveResetToken(int id, String token, LocalDateTime expiry){
        String query = "insert into authToken (Uid,token,expirey_time) values (?,?,?)";
        jdbcTemplate.update(query,id,token,expiry);
    }

   public void save(String name, String username, String email, String passwords, String phoneNumber){
        String query = "insert into users(name,username,email,passwords,phoneNumber) values (?,?,?,?,?)";
        jdbcTemplate.update(query,name,username,email,passwords,phoneNumber);
   }

   public Long validateResetToken(String token){
        String query = "select Uid from authToken where token = ? and expirey_time>currentTimestamp and used_yn = 0";
        try{
            return jdbcTemplate.queryForObject(query,Long.class,token);
        }catch (EmptyResultDataAccessException e){
            return null;
        }
   }
   public void updatePassword(String password,Long userId,String token){
        String query = "update users set passwords = ? where Uid = ?";
        jdbcTemplate.update(query,password,userId);

        String query1 = "update authToken set used_yn = 1 where token = ?";
        jdbcTemplate.update(query1,token);
        // 2 queries one for upadating password and another one for changing used-yn
   }
}
