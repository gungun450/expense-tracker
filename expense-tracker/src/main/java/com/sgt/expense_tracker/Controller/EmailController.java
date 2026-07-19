package com.sgt.expense_tracker.Controller;

// this one also practice one and does not send any important emails


import com.sgt.expense_tracker.Service.EmailSendService;
import com.sgt.expense_tracker.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmailController {

    @Autowired
    EmailService emailService;

    @GetMapping("/send-email")
     public String sendEmail(){
        //emailsendService.sendReport();
        emailService.sendEmail("gungun.narwani.st@gmail.com","15 Minutes token");
        return "Email Sent successfully";
    }
}
