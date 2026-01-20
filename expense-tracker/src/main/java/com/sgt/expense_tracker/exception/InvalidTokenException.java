package com.sgt.expense_tracker.exception;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException() {
        super("Invalid or Expired token");
    }
}
