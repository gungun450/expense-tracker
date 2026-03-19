package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Model.Category;
import com.sgt.expense_tracker.Model.ResponseBulkUploadModel;
import com.sgt.expense_tracker.Model.Transaction;
import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import com.sgt.expense_tracker.Repository.CategoryRepository;
import com.sgt.expense_tracker.Repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import static com.sgt.expense_tracker.Constant.constants.DEFAULT_CATEGORY_DESCRIPTION;
import static com.sgt.expense_tracker.Constant.constants.DEFAULT_ICON_URL;

@Service
public class TransactionService {
    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AuthRepository authRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    AIService aiService;


    Logger logger = LoggerFactory.getLogger(TransactionService.class);

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

    public List<ResponseBulkUploadModel> read (MultipartFile file, Authentication auth) throws IOException {
        Scanner sc = new Scanner(file.getInputStream());
        sc.nextLine();
        //List<List<String>> errors = new ArrayList<>();
        List<ResponseBulkUploadModel> result = new ArrayList<>();

        User user = authRepository.FindByEmail(auth.getName());

        while(sc.hasNext()){
            ResponseBulkUploadModel bulkUploadModel = new ResponseBulkUploadModel();
            String row = sc.nextLine();
            String [] rowData = row.split(",");
            List<String> errorRow = new ArrayList<>();

           Double Amount = 0.0;
           String note = rowData[1];
           String CategoryName = rowData[2].toLowerCase().trim();
           LocalDate localDate = LocalDate.now();
           String type = rowData[4].toUpperCase().trim();

//           if(rowData.length < 5){
//                errorRow.add("Invalid CSV format");
//                result.add(errorRow);
//                continue;
//            }

           try{
               Amount = Double.parseDouble(rowData[0]);
           }catch(Exception e){
                errorRow.add("Amount is Invalid");
           }
           if(Amount<=0){
               errorRow.add("Amount is Invalid and it is less then zero ");
           }
           if(CategoryName==null || CategoryName.trim().isEmpty()){
               //get category from prompt
               // get list of categories
               // note in my code
               List<Category> existingCategoriesList = categoryRepository.getAll(user.getId());
               List<String> existingCategories = new ArrayList<>();
               for(Category category: existingCategoriesList){
                   existingCategories.add(category.getName());
               }
               CategoryName = aiService.suggestCategory(note,existingCategories);

               if(CategoryName==null){
                   errorRow.add("Category cannot be identified");
               }
           }

           try{
               localDate = LocalDate.parse(rowData[3]);
           }catch(Exception e){
               errorRow.add("Invalid Date format");
           }
           if(localDate!=null&&localDate.isAfter(LocalDate.now()) ){
               errorRow.add("Transaction Date cannot be from Future");
           }

           if(type!=null && !type.toUpperCase().equals("EXPENSE") && !type.toUpperCase().equals("INCOME") ){
               errorRow.add("type must be income / expense");
           }

           if(errorRow.isEmpty()){
           logger.info("processing Record - {},{},{},{},{}",Amount,note,CategoryName,localDate,type);
            Category category = categoryRepository.findByNameTypeAndUserId(CategoryName,type, user.getId());
           if(category!=null){
               logger.info("Found Category - {},{}",category.getName(),category.getCid());
           }else{
               logger.info("Not Found Category- inserting one");
               //categoryRepository.save(user.getId(), note , DEFAULT_CATEGORY_DESCRIPTION, DEFAULT_ICON_URL,type);
               // above one is wrong
               categoryRepository.save(user.getId(), CategoryName, DEFAULT_CATEGORY_DESCRIPTION,DEFAULT_ICON_URL,type);
                category  = categoryRepository.findByNameTypeAndUserId(CategoryName,type, user.getId());

               Transaction transaction = new Transaction();
               transaction.setAmount(Amount);
               transaction.setNotes(note);
               transaction.setDateOfTransaction(localDate);
               transaction.setCid(category.getCid());

                    transactionRepository.create(user.getId(),
                       transaction.getCid(),
                       transaction.getAmount(),
                       transaction.getNotes(),
                       transaction.getDateOfTransaction());

               logger.info("Transaction Saved");
           }
              //Transaction transaction = transactionRepository.

           }
//              bulkUploadModel.setError(errorRow);
            bulkUploadModel.setType(type);
            bulkUploadModel.setAmount(Amount);
            bulkUploadModel.setCategory(CategoryName);
            bulkUploadModel.setName(note);
            bulkUploadModel.setLocalDate(localDate);
            bulkUploadModel.setError(errorRow);
            result.add(bulkUploadModel);
       }
       return result;
    }


}
