package com.sgt.expense_tracker.Model;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class Transaction {
    int Tid;
    int Cid;
    int Uid;
    double amount;
    String notes;
    LocalDate dateOfTransaction;
    int active_yn;
    String CategoryName;
    String CategoryType;

}
