package com.sgt.expense_tracker.Model;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class User {

    int id;
    String name;
    String username;
    String email;
    String passwords;
    String phoneNumber;
    int active_yn;

}
