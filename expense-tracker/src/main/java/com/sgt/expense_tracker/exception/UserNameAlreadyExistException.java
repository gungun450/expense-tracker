package com.sgt.expense_tracker.exception;

public class UserNameAlreadyExistException extends RuntimeException {
    public UserNameAlreadyExistException() {
        super("UserName Already Exists!!");
    }
}
