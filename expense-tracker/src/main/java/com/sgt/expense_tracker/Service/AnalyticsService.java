package com.sgt.expense_tracker.Service;

import com.sgt.expense_tracker.Model.LineChartModel;
import com.sgt.expense_tracker.Model.MultiLineChartModel;
import com.sgt.expense_tracker.Model.PieChartModel;
import com.sgt.expense_tracker.Model.User;
import com.sgt.expense_tracker.Repository.AnalyticsRepository;
import com.sgt.expense_tracker.Repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {
    @Autowired
    AnalyticsRepository analyticsRepository;

    @Autowired
    AuthRepository authRepository;

    public List<PieChartModel> getPieChartIncomeData(String email){
        User user = authRepository.FindByEmail(email);
        return analyticsRepository.getPieChartIncomeData(user.getId());
    }
    public List<PieChartModel> getPieChartExpenseData(String email){
        User user = authRepository.FindByEmail(email);
        return analyticsRepository.getPieChartExpenseData(user.getId());
    }
    public List<MultiLineChartModel> getMultiLineChartData(String email){
        User user = authRepository.FindByEmail(email);
        return analyticsRepository.getMultiLineChartData(user.getId());
    }
    public List<LineChartModel> getLineChartSavingsData(String email){
        User user = authRepository.FindByEmail(email);
        return analyticsRepository.getLineChartSavingsData(user.getId());
    }
//     public void getStackedBarChartData(String email){
//
//    }
}
