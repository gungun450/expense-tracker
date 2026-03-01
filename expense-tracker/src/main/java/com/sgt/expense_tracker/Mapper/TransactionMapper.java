package com.sgt.expense_tracker.Mapper;

import com.sgt.expense_tracker.Model.Transaction;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;

public class TransactionMapper implements RowMapper<Transaction> {

    @Override
    public Transaction mapRow(ResultSet rs, int rowNum) throws SQLException {
        Transaction t1 = new Transaction();

        t1.setTid(rs.getInt("Tid"));
        t1.setUid(rs.getInt("Uid"));
        t1.setCid(rs.getInt("Cid"));
        t1.setAmount(rs.getInt("amount"));
        t1.setNotes(rs.getString("notes"));
        t1.setDateOfTransaction(LocalDate.parse(rs.getString("dateOfTransaction")));
        t1.setActive_yn(rs.getInt("active_yn"));

        t1.setCategoryName(rs.getString("name"));
        t1.setCategoryType(rs.getString("type"));

        return t1;
    }
}
