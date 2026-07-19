package com.sgt.expense_tracker.automationJobs;

import com.sgt.expense_tracker.Service.EmailSendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


// it is used for corn job scheduling

@Component
public class ReportScheduler {
    @Autowired
    EmailSendService emailSendService;

@Scheduled(cron = "0 0 */3 * * *")
// every 3 hours 1 report will be sent
    public void sendReport() {
        System.out.println("sending report...");
        emailSendService.sendReport();
    }
}

