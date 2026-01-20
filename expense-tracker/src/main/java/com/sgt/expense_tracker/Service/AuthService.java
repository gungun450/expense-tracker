package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import com.sgt.expense_tracker.exception.EmailAlreadyExistsException;
import com.sgt.expense_tracker.exception.InvalidEmailException;
import com.sgt.expense_tracker.exception.InvalidTokenException;
import com.sgt.expense_tracker.exception.UserNameAlreadyExistException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AuthService {
    @Autowired
    AuthRepository authRepository;

    @Autowired
    JavaMailSender mailSender;

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

        authRepository.save(user.getName(),
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

    // forget password --
    // first validate email
    //  find by email -- check if exists
    // localDateTime is easily covertilbe in timestamp in db

    public void forgotPassword(User user) throws InvalidEmailException, MessagingException {
        if(!isEmailValid(user.getEmail())) {
            throw new InvalidEmailException();
        }
         User user1 = authRepository.FindByEmail(user.getEmail());
        if(user1 == null) {
         throw new InvalidEmailException();
        }else{
            // token generations
            String token = UUID.randomUUID().toString();
            LocalDateTime expiry =  LocalDateTime.now().plusMinutes(15);
            authRepository.saveResetToken(user1.getId(),token,expiry);
            // if inserted successfully then send link on that email

            MimeMessage message = mailSender.createMimeMessage();
            //creating helper to help update the message
            MimeMessageHelper messageHelper = new MimeMessageHelper(message);
            messageHelper.setTo(user1.getEmail());
            try {
                messageHelper.setSubject("Reset Password - Expense Tracker");
                String html = """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Expense Tracker</h2>
            <p>You requested to reset your password.</p>
             <p>Your reset token is:</p>
             <p style="background-color: #f0f0f0; padding: 10px; font-family: monospace;">%s</p>
              <p>Or click the link below:</p>
             <a href="%s" style="color: #007bff;">Reset Password</a>
             <p style="color: #666; font-size: 12px;">This token is valid for 15 minutes.</p>
             </body>
             </html>
            """;

          String resetLink = "http://localhost:5173/reset-password?token=" + token;
          String formattedHtml = html.formatted(token, resetLink);
          messageHelper.setSubject("Reset Password - Expense Tracker");
          messageHelper.setText(formattedHtml, true); // true indicates HTML content
             } catch (MessagingException e) {
                 throw new RuntimeException(e);
            }
            // asked mail sender to send the mail
            //mailSender.sendResetLink(email,resetLink);
             mailSender.send(message);
        }
    }

    // login  String email,String password
    public void login(User user) throws InvalidEmailException{
            String email = user.getEmail();
            String password = user.getPasswords();
           if(!isEmailValid(email)){
            throw new InvalidEmailException();
           }
          User user1 = authRepository.FindByEmail(email);
          // put logger here that login got successfull
          // if not null then it exists
          if(user1!=null) {
            // check if enetred is corrected or not
            return;
          }
          // check passowrd
    }

    public void resetPassword(String token,String password) throws InvalidTokenException {
        Long userId = authRepository.validateResetToken(token);

        if(userId == null)  {
            throw new InvalidTokenException();
        }
        String hashedPassword = encodePassword(password);
        authRepository.updatePassword(hashedPassword,userId,token);
    }
}
