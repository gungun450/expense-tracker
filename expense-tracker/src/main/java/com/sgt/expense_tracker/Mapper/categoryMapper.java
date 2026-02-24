package com.sgt.expense_tracker.Mapper;

import com.sgt.expense_tracker.Model.Category;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;


public class categoryMapper implements RowMapper<Category> {

    @Override
    public Category mapRow(ResultSet rs, int rowNum) throws SQLException{
        Category c1 = new Category();
        c1.setUid(rs.getInt("Uid"));
        c1.setCid(rs.getInt("Cid"));
        c1.setName(rs.getString("name"));
        c1.setType(rs.getString("type"));
        c1.setDescription(rs.getString("description"));
        c1.setIconUrl(rs.getString("iconUrl"));
        c1.setActive_yn(rs.getInt("active_yn"));

        return c1;
    }
}
