package com.sgt.expense_tracker.exception;

public class CategoryDoesNotExistException extends RuntimeException {
    public CategoryDoesNotExistException() {
        super("Category Do Not Exist!!!");
    }
}
