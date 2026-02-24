package com.sgt.expense_tracker.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class Category {
    int Cid;
    int Uid;
    String name;
    String description;
    String iconUrl;
    String type; // income or expense
    int active_yn;
}
