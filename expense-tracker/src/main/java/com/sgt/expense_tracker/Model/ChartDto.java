package com.sgt.expense_tracker.Model;

import lombok.Getter;
import lombok.Setter;

import javax.sound.sampled.Line;
import java.util.List;

@Getter
@Setter
public class ChartDto {
     List<PieChartModel> pieChartIncomeList;
     List<PieChartModel> pieChartExpenseList;

     List<MultiLineChartModel> multiLineChartList;
     List<LineChartModel> lineChartSavingsList;
}
