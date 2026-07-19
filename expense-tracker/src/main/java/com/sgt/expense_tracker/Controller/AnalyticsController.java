package com.sgt.expense_tracker.Controller;

import com.sgt.expense_tracker.Model.ChartDto;
import com.sgt.expense_tracker.Service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class AnalyticsController {
    @Autowired
    AnalyticsService analyticsService;

    @GetMapping("/api/dashboard")
    public ChartDto getDashboard(Authentication auth){
        ChartDto chartDto = new ChartDto();
         chartDto.setPieChartIncomeList(analyticsService.getPieChartIncomeData(auth.getName()));
         chartDto.setPieChartExpenseList(analyticsService.getPieChartExpenseData(auth.getName()));

         chartDto.setMultiLineChartList(analyticsService.getMultiLineChartData(auth.getName()));
         chartDto.setLineChartSavingsList(analyticsService.getLineChartSavingsData(auth.getName()));

         return chartDto;
    }

}
