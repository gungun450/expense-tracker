package com.sgt.expense_tracker.Service;


import com.sgt.expense_tracker.Model.Category;
import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AuthRepository;
import com.sgt.expense_tracker.Repository.CategoryRepository;
import com.sgt.expense_tracker.exception.CategoryDoesNotExistException;
import com.sgt.expense_tracker.exception.InvalidEmailException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    AuthRepository authRepository;

    Logger logger = LoggerFactory.getLogger(CategoryService.class);

    public List<Category>get(int id) {
        return categoryRepository.getAll(id);
    }

    public void createCategory(Category category, String email) throws InvalidEmailException {
        User result = authRepository.FindByEmail(email);
        if (category.getType() == null) {
            category.setType("Expense");
        }
        int id = 0;
        if (result == null) {
            throw new InvalidEmailException();
            // throw exception user donot exist or invalid user
        } else {
            id = result.getId();
        }
        //logger.info("came in service");
        categoryRepository.save(id,
                category.getName(),
                category.getDescription(),
                category.getIconUrl(),
                category.getType());
    }

    public void softDelete(int uid, int cid) throws CategoryDoesNotExistException {
        Category category = categoryRepository.findByCid(cid);
        if(category==null){
            throw new CategoryDoesNotExistException();
        }
        //logger.info("calling in repo for soft delete");
        // verify id that category belongs to that user
        if(category.getUid()!=uid){
            logger.info("That category id " + cid + " doesnot belong to user "+uid);
            throw new CategoryDoesNotExistException();
        }
        categoryRepository.softDelete(uid,cid);
    }

    public void updateCategory(Category category) {
        Category c1 = categoryRepository.findByCid(category.getCid());
        if(c1==null){
            throw new CategoryDoesNotExistException();
        }
        // category can have same names
        categoryRepository.update(category.getUid(),
                category.getCid(),
                category.getName(),
                category.getDescription(),
                category.getIconUrl(),
                category.getType());
    }
}
