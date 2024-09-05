import { Pipe, PipeTransform } from "@angular/core";
import { Habit, HabitFrequency } from "../habits/habit.model";
import { GroupedCollection } from "./group-by.pipe";

const frequencyOrder: HabitFrequency[] = ["daily", "weekly", "monthly", "finite"];

@Pipe({
    name: "sortByFrequency",
    standalone: true
})
export class SortFrequencyPipe implements PipeTransform {
    transform(collection: Array<GroupedCollection<Habit, "frequency">>): Array<GroupedCollection<Habit, "frequency">> {
        return collection.sort((a, b) => {
            const aIndex = frequencyOrder.indexOf(a.key);
            const bIndex = frequencyOrder.indexOf(b.key);
            return aIndex - bIndex;
        });
    }
}
