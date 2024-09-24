import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexFill,
    ApexMarkers,
    ApexTitleSubtitle,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from "ng-apexcharts";
import { Habit } from "../../habit.model";
import { convertHabitToHistoryCompletion } from "../../habit.utils";

function getHabitCompletionGraphData(habit: Habit) {
    const completions = convertHabitToHistoryCompletion(habit, undefined, 50);
    return completions.map((completion) => {
        return [new Date(completion.period).getTime(), completion.completions];
    });
}

@Component({
    selector: "habit-chart",
    standalone: true,
    imports: [CommonModule, NgApexchartsModule],
    templateUrl: "./habit-chart.component.html",
    styleUrl: "./habit-chart.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitChartComponent {
    habit = input.required<Habit>();

    chart: ApexChart = {
        type: "area",
        stacked: false,
        height: 350,
        zoom: {
            type: "x",
            enabled: true,
            autoScaleYaxis: true
        },
        toolbar: {
            autoSelected: "zoom"
        }
    };

    dataLabels: ApexDataLabels = {
        enabled: false
    };
    markers: ApexMarkers = {
        size: 0
    };
    title: ApexTitleSubtitle = {
        text: "Completions over Time",
        align: "left",
        style: {
            fontFamily: "Abel"
        }
    };
    fill: ApexFill = {
        type: "gradient",
        gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0.3,
            stops: [0, 90, 100]
        }
    };
    yaxis: ApexYAxis = {
        // labels: {
        //     formatter: function (val: number) {
        //         return (val / 1000000).toFixed(0);
        //     }
        // },
        // title: {
        //     text: "Price"
        // }
    };
    xaxis: ApexXAxis = {
        type: "datetime",
        labels: {
            show: false
        }
    };
    tooltip: ApexTooltip = {
        x: {
            show: false
        }
    };

    annotations = computed(() => {
        return {
            yaxis: [
                {
                    y: this.habit().targetMetric.goal,
                    borderColor: "#daa420",
                    label: {
                        borderColor: "#daa420",
                        style: {
                            color: "#fff",
                            background: "#daa420"
                        },
                        text: "Goal"
                    }
                }
            ]
        };
    });

    series = computed<ApexAxisChartSeries>(() => {
        const habit = this.habit();
        return [
            {
                name: habit.name,
                data: getHabitCompletionGraphData(habit)
            }
        ];
    });
}
