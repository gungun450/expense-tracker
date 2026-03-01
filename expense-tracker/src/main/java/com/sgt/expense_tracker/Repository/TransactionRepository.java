package com.sgt.expense_tracker.Repository;

import com.sgt.expense_tracker.Mapper.TransactionMapper;
import com.sgt.expense_tracker.Model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TransactionRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

    public void create(int id,int cid, double amount, String notes, LocalDate dateOfTransaction) {
        String query = "insert into Transaction (Uid,Cid,amount,notes,dateOfTransaction) values(?,?,?,?,?)";
        jdbcTemplate.update(query,id,cid,amount,notes,dateOfTransaction);
    }

    public List<Transaction> getAll(int id, String category, String type, LocalDate start, LocalDate end, String Column,
                                    String direction, Integer pageNumber, Integer noOfRecordsPerPage){

        if("dataOfTransaction".equals(Column)){
            Column = "t.dateOfTransaction";

        }
        if("amount".equals(Column)){
            Column = "amount";
        }

        StringBuilder sql = new StringBuilder("select t.Tid, t.Uid , t.Cid , t.amount , t.dateOfTransaction ,t.active_yn ,t.notes, c.name, c.type\n" +
                "from Transaction t\n" +
                "inner join category c\n" +
                "on t.Cid = c.Cid\n" +
                "where t.active_yn = 1 and t.Uid = ?");

        ArrayList<Object> params = new ArrayList<>();

        params.add(id);
        if(category!=null){
            sql.append(" and  c.name = ?");
            params.add(category);
        }
        if(type!=null){
            sql.append(" and c.type = ?");
            params.add(type);
        }
        if(end!=null){
            start = (start == null) ? end.minusDays(30) : start;
            // means we have end date and we will find start
            sql.append(" and t.dateOfTransaction between ? and ?");
            params.add(start);
            params.add(end);
        }else if(start!=null){
            end = LocalDate.now();
            sql.append(" and t.dateOfTransaction between ? and ?");
            params.add(start);
            params.add(end);
        }
        sql.append(" ORDER by ").append(Column).append(" ").append(direction);

        if((noOfRecordsPerPage!= null) && (pageNumber!= null)){
            sql.append(" LIMIT ? OFFSET ?");
            params.add(noOfRecordsPerPage);
            params.add((pageNumber-1)*(noOfRecordsPerPage));
        }

//        System.out.println(sql.toString());
        // System.out.println(params.toString());
        return jdbcTemplate.query(sql.toString(), new TransactionMapper(), params.toArray());  // --> VAR ARGS
    }
}
