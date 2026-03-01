package com.sgt.expense_tracker.Service;


import com.sgt.expense_tracker.Model.Transaction;
import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import com.sgt.expense_tracker.Repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {
    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AuthRepository authRepository;

    public void create(Transaction transaction, Authentication auth) {
        User user = authRepository.FindByEmail(auth.getName());
        if(user == null ){
            throw new RuntimeException();
        }
         int id = user.getId();

        transactionRepository.create(id,
                transaction.getCid(),
                transaction.getAmount(),
                transaction.getNotes(),
                transaction.getDateOfTransaction()
        );
    }

    public List<Transaction> getAll(Authentication auth, String category, String type, LocalDate start, LocalDate end,
                                    String Column, String Direction, Integer pageNumber, Integer noOfRecordsPerPage) {
        User user = authRepository.FindByEmail(auth.getName());
        //int id = user.getId();
        return transactionRepository.getAll(user.getId(),category,type,start,end,Column,Direction,pageNumber, noOfRecordsPerPage);
    }

    public void read(MultipartFile file) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));
        //BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        //System.out.println(br.);
        System.out.println(br.readLine());
        System.out.println(br.readLine());
        System.out.println(br.readLine());
        System.out.println(br.readLine());
    }
}
