import { Pipe, PipeTransform } from "@angular/core";

export type GroupedCollection<T, K extends keyof T> = {
    key: T[K];
    value: T[];
};

@Pipe({
    name: "groupBy",
    standalone: true
})
export class GroupByPipe implements PipeTransform {
    transform<T, K extends keyof T>(collection: ReadonlyArray<T>, property: K): Array<GroupedCollection<T, K>> {
        // prevents the application from breaking if the array of objects doesn't exist yet
        if (!collection) {
            return [];
        }

        const groupedCollection = collection.reduce(
            (previous, current) => {
                const key = current[property] as unknown as string; // converting to string for object key usage
                if (!previous[key]) {
                    previous[key] = [current];
                } else {
                    previous[key].push(current);
                }
                return previous;
            },
            {} as Record<string, T[]>
        );

        // this will return an array of objects, each object containing a group of objects
        return Object.keys(groupedCollection).map((key) => ({
            key: key as unknown as T[K], // casting back to original type
            value: groupedCollection[key]
        }));
    }
}
