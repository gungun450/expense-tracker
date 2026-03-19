package com.sgt.expense_tracker.Model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ResponseBulkUploadModel {
    Double Amount ;
    LocalDate localDate;
    String name;
    String type;
    String Category;
    List<String> error;

}
