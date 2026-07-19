package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Repository.AuthRepository;
import com.sgt.expense_tracker.Repository.TransactionRepository;
import com.sgt.expense_tracker.Model.Transaction;
import com.sgt.expense_tracker.Model.User;
import jakarta.mail.internet.MimeMessage;
import org.openpdf.text.Document;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailSendService {
    @Autowired
    JavaMailSender mailSender;
    @Autowired
    AuthRepository authRepository;

    @Autowired
    TransactionRepository transactionRepository;
    Logger logger= LoggerFactory.getLogger(EmailSendService.class);

// early it was used as practice and now using this file for sending corn job scheduling

//    public void sendEmail(String to,String token){
//        create the message to be sent
//        MimeMessage message=mailSender.createMimeMessage();
////        create helper that could help you writing the message
//        MimeMessageHelper messageHelper=new MimeMessageHelper(message);
//        try{
//            messageHelper.setTo(to);
//            messageHelper.setSubject("Reset Password-Expense Tracker");
//           messageHelper.setText(token,"<h1>heyy!!trying html for first time</h1>");
//            messageHelper.setText(buildHtml(token),true);
//            mailSender.send(message);
//            logger.info("mail sent");
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }

    public void sendReport() {
        List<User> users = authRepository.getAllUsers();

        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(7);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        try {
            for (User user : users) {
                byte[] report=getReport(user,sevenDaysAgo,today);
                MimeMessage message = mailSender.createMimeMessage();
                //we are sending a byte array so we have to set multipart as true
                MimeMessageHelper messageHelper = new MimeMessageHelper(message,true);

                messageHelper.setTo(user.getEmail());
                messageHelper.setSubject("Your Weekly Expense Report");

                Resource resource=new ByteArrayResource(report);
                messageHelper.addAttachment("WeeklyReport.pdf",resource);
                List<Transaction> transactions=transactionRepository.getAll(user.getId(), null, null, sevenDaysAgo, today, "dateOfTransaction", "desc", null, null);
                logger.info(transactions.toString());
                String htmlContent =
                        "<div style='font-family: Arial;'>" +
                                "<h2>Expense Report</h2>" +
                                "<p>Hello " + user.getName() + ",</p>" +
                                "<p>Please find your attached expense report for the period:</p>" +
                                "<p><b>" + sevenDaysAgo + " to " + today + "</b></p>" +
                                "<p>The report is attached with this email.</p>" +
                                "<br><p>Regards,<br>Expense Tracker Team</p>" +
                                "</div>";

                messageHelper.setText(htmlContent, true);


                mailSender.send(message);
                logger.info("mail sent to " + user.getEmail());
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
 private byte[] getReport(User user,LocalDate sevenDaysAgo,LocalDate today){
     List<Transaction> transactions=transactionRepository.getAll(user.getId(), null, null, sevenDaysAgo, today, "dateOfTransaction", "desc", null, null);
     logger.info(transactions.toString());
     //here first we are creating buffer
     ByteArrayOutputStream out=new ByteArrayOutputStream();
     //document jisme likhna h
     Document document=new Document();
     //humare doc se ram ko link krenge
     PdfWriter.getInstance(document,out);
     document.open();
     document.add(new Paragraph("Transaction Report"));
     document.add(new Paragraph("Generated on:"+LocalDate.now()));
     //Paragraph p1=new Paragraph();
     PdfPTable table=new PdfPTable(3);
     table.setWidthPercentage(100);
     table.addCell("Date");
     table.addCell("Category");
     table.addCell("Amount");

     for(Transaction t:transactions){
         table.addCell(t.getDateOfTransaction().toString());
         table.addCell(t.getCategoryName().toString());
         table.addCell(String.valueOf(t.getAmount()));
     }
     document.add(table);
     document.close();

     return out.toByteArray();
 }


 // This one also and the reset password is in AuthService

//      public String buildHtml(String token){
//        return "<div style=\" margin:auto;\">\n" +
//                "    <h1 style=\"text-align: center;color: rgb(0, 65, 130);\">Password Reset</h1>\n" +
//                "    <p style=\"text-align: center;\">A request for password reset has been made for your account.Below is the password reset link.</p>\n" +
//                "    <p style=\"color: red;text-align: center;font-weight: bold;\">The link is active only for 5 minutes.</p>\n" +
//                "    <a style=\"padding:1rem;text-align: center;\n" +
//                "    background-color: rgb(26, 129, 231); \n" +
//                "    color: white;border-radius: 5px;border:none;\" href=\"http://localhost:4200/reset-password/"+token+"\">Reset password</a>\n" +
//                "</div>";
//     }


}
