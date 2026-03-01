package com.sgt.expense_tracker.Repository;

import com.sgt.expense_tracker.Mapper.categoryMapper;
import com.sgt.expense_tracker.Model.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CategoryRepository {
     @Autowired
     JdbcTemplate jdbcTemplate;

     Logger logger = LoggerFactory.getLogger(CategoryRepository.class);

     public List<Category> getAll(int Uid){
         String query = "select Cid,Uid,name,description,iconUrl,`type`,active_yn from category where Uid = ? AND active_yn = 1";
         return jdbcTemplate.query(query , new categoryMapper(), Uid);
     }

    public void save(int Uid, String name, String description, String iconUrl, String type) {
         String query = "insert into category(Uid,name,description,iconUrl,`type`) values(?,?,?,?,?)";
         //logger.info("inserting into database");
         jdbcTemplate.update(query,Uid,name,description,iconUrl,type);
    }

    public Category findByCid(int Cid){
         String query ="select Cid,Uid,name,description, iconUrl,`type`,active_yn from category where Cid = ? AND active_yn = 1";
         try{
              return jdbcTemplate.queryForObject(query,new categoryMapper(),Cid);
         }catch(EmptyResultDataAccessException e){
             return null;
         }

    }



    public void softDelete(int uid, int cid) {
         String query = "update category set active_yn=0, updated_at=CURRENT_TIMESTAMP where Cid = ? and Uid = ? and active_yn = 1";
         jdbcTemplate.update(query,cid,uid);
    }

    public void update(int Uid, int Cid,String name, String description, String iconUrl, String type) {
         String query = "update category set name = ?,description = ?, iconUrl = ?, `type` = ? WHERE Cid = ? AND Uid = ?";
         jdbcTemplate.update(query,name,description,iconUrl,type,Cid,Uid);
    }
}
