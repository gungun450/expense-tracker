package com.sgt.expense_tracker.Service;


// practice one does not send any important mails


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    JavaMailSender mailSender;

    public void sendEmail(String to,String token){
        MimeMessage message = mailSender.createMimeMessage();
        //creating helper to help update the message
        MimeMessageHelper messageHelper = new MimeMessageHelper(message);
        try{
            messageHelper.setTo(to);
            messageHelper.setText(token);
            messageHelper.setSubject("Reset Password - Expense Tracker");

            // asked mail sender to send the mail
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }

    }
}
