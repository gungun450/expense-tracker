package com.sgt.expense_tracker.Controller;

import com.sgt.expense_tracker.Model.Transaction;
import com.sgt.expense_tracker.Service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")

public class TransactionController {
    @Autowired
    TransactionService transactionService;

     Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @PostMapping
    public ResponseEntity<Map<String,String>> CreateTransaction(@RequestBody Transaction transaction, Authentication auth){
        try{
          transactionService.create(transaction,auth);
          return ResponseEntity.ok(Map.of("body","Created Successfully"));
        } catch (RuntimeException e) {
            //throw new RuntimeException(e);
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }

    }

    @GetMapping
    public List<Transaction> getAll(Authentication auth,
                                    @RequestParam(name = "category" ,required = false)String Category,
                                    @RequestParam(name = "type" ,required = false) String type,
                                    @RequestParam(name = "start" , required = false)LocalDate start,
                                    @RequestParam(name = "end" , required = false)LocalDate end,
                                    @RequestParam(name = "column",defaultValue = "dateOfTransaction") String Column,
                                    @RequestParam(name = "direction",defaultValue = "DESC") String Direction,
                                    @RequestParam(name = "pageNumber" ,required = false) Integer PageNumber,
                                    @RequestParam(name ="NoOfRecordsPerPage" , required = false) Integer NoOfRecordsPerPage
                                    )
        {
           // System.out.println(Category);
        List<Transaction> t1= transactionService.getAll(auth,Category, type,start,end,Column,Direction,PageNumber, NoOfRecordsPerPage);
        return t1;
    }

    @PostMapping("/bulk-upload")
    public void bulkUpload(@RequestParam(name = "file")MultipartFile file){
        System.out.println(file.getOriginalFilename());
        try{
            transactionService.read(file);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
}
