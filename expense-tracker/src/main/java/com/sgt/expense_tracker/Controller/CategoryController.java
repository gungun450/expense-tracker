package com.sgt.expense_tracker.Controller;


import com.sgt.expense_tracker.Model.Category;
import com.sgt.expense_tracker.Service.CategoryService;
import com.sgt.expense_tracker.exception.CategoryDoesNotExistException;
import com.sgt.expense_tracker.exception.InvalidEmailException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class CategoryController {
    @Autowired
    CategoryService categoryService;

    Logger logger = LoggerFactory.getLogger(CategoryController.class);

    // get all categories for that user
    @GetMapping("/categories/{uid}")
    public ResponseEntity<?> get(@PathVariable int uid){
        try{
            List<Category> categories = categoryService.get(uid);
            return ResponseEntity.ok().body(categories);
        } catch (Exception e) {
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }
    }
    // add
    @PostMapping("/categories/add")
    public ResponseEntity<Map<String,String>> createCategory(@RequestBody Category category, Authentication auth){
        System.out.println(auth.getName());

        try{
            categoryService.createCategory(category,auth.getName());
            //logger.info("Inserted Successfully");
            return ResponseEntity.ok().body(Map.of("body","Created category Successfully"));
        } catch (InvalidEmailException e) {
             logger.info(e.getMessage());
            //throw new RuntimeException(e);
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }
    }

    // soft delete
    @PatchMapping("/categories/{Cid}/delete/{Uid}")
    public ResponseEntity<Map<String,String>> softDelete(@PathVariable int Uid, @PathVariable int Cid){
        try{
            categoryService.softDelete(Uid,Cid);
            return ResponseEntity.ok().body(Map.of("body","Deleted Successfully"));
        } catch (CategoryDoesNotExistException e) {
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }

    }

    // update
    @PutMapping("categories/update")
    public ResponseEntity<Map<String,String>> updateCategory(@RequestBody Category category){
        try{
        categoryService.updateCategory(category);
        return ResponseEntity.ok().body(Map.of("body","Updated Successfully"));
        }catch(CategoryDoesNotExistException e){
            logger.info(e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("body",e.getMessage()));
        }

    }
}
