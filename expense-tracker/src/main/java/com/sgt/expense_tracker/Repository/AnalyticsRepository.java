package com.sgt.expense_tracker.Repository;

import com.sgt.expense_tracker.Model.LineChartModel;
import com.sgt.expense_tracker.Model.MultiLineChartModel;
import com.sgt.expense_tracker.Model.PieChartModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;

@Repository
public class AnalyticsRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

     public List<PieChartModel> getPieChartIncomeData(int userId){

        String query = "SELECT \n" +
                "    c.name AS category,\n" +
                "    SUM(t.amount) AS Amount\n" +
                "FROM category c\n" +
                "JOIN `transaction` t ON t.Cid = c.Cid\n" +
                "WHERE c.Type = 'income'\n" +
                "  AND t.Uid = ?\n" +
                "  AND t.active_yn = 1\n" +
                "GROUP BY c.name;";

        List<PieChartModel> results = jdbcTemplate.query(query , (ResultSet rs, int rowNum)->{
            PieChartModel pieChartModel = new PieChartModel();
            pieChartModel.setAmount(rs.getLong("Amount"));
            pieChartModel.setCategory(rs.getString("category"));
            return pieChartModel;
        } , userId);

        return results;
    }

     public List<PieChartModel> getPieChartExpenseData(int userId){
      String query = "SELECT \n" +
                "    c.name AS category,\n" +
                "    SUM(t.amount) AS Amount\n" +
                "FROM category c\n" +
                "JOIN `transaction` t ON t.Cid = c.Cid\n" +
                "WHERE c.Type = 'expense'\n" +
                "  AND t.Uid = ?\n" +
                "  AND t.active_yn = 1\n" +
                "GROUP BY c.name;";

        List<PieChartModel> results = jdbcTemplate.query(query , (ResultSet rs, int rowNum)->{
            PieChartModel pieChartModel = new PieChartModel();
            pieChartModel.setAmount(rs.getLong("Amount"));
            pieChartModel.setCategory(rs.getString("category"));
            return pieChartModel;
        } , userId);

        return results;
    }

     public List<MultiLineChartModel> getMultiLineChartData(int userId) {
        String query = "SELECT " +
                " DATE_FORMAT(MIN(t.dateOfTransaction), '%b %Y') AS month, " +
                " SUM(CASE WHEN c.Type = 'income' THEN t.amount ELSE 0 END) AS income, " +
                " SUM(CASE WHEN c.Type = 'expense' THEN t.amount ELSE 0 END) AS expense " +
                "FROM `transaction` t " +
                "INNER JOIN category c ON t.Cid = c.Cid " +
                "WHERE t.Uid = ? " +
                "AND t.active_yn = 1 " +
                "AND t.dateOfTransaction >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) " +
                "GROUP BY YEAR(t.dateOfTransaction), MONTH(t.dateOfTransaction) " +
                "ORDER BY YEAR(t.dateOfTransaction) ASC, MONTH(t.dateOfTransaction) ASC";

        List<MultiLineChartModel> results = jdbcTemplate.query(query, (ResultSet rs, int rowNum) -> {
            MultiLineChartModel multiLineChartModel = new MultiLineChartModel();
            multiLineChartModel.setMonth(rs.getString("month"));
            multiLineChartModel.setIncome(rs.getLong("income"));
            multiLineChartModel.setExpense(rs.getLong("expense"));
            return multiLineChartModel;
        }, userId);

        return results;
    }

     public List<LineChartModel> getLineChartSavingsData(int userId) {
        String query = "SELECT " +
                " DATE_FORMAT(MIN(t.dateOfTransaction), '%b %Y') AS month, " +
                " SUM(CASE WHEN c.Type = 'income' THEN t.amount ELSE 0 END) " +
                " - " +
                " SUM(CASE WHEN c.Type = 'expense' THEN t.amount ELSE 0 END) AS savings " +
                "FROM `transaction` t " +
                "JOIN category c ON t.Cid = c.Cid " +
                "WHERE t.Uid = ? " +
                "AND t.active_yn = 1 " +
                "GROUP BY YEAR(t.dateOfTransaction), MONTH(t.dateOfTransaction) " +
                "ORDER BY YEAR(t.dateOfTransaction), MONTH(t.dateOfTransaction)";

        return jdbcTemplate.query(query, (ResultSet rs, int rowNum) -> {
            LineChartModel lineChartModel = new LineChartModel();
            lineChartModel.setSavings(rs.getLong("savings"));
            lineChartModel.setMonth(rs.getString("month"));
            return lineChartModel;
        }, userId);
    }
    public void getStackedBarChartData(){

    }
}
