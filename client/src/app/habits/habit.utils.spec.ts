import { generatePeriods, getPeriodKey } from "./habit.utils";

describe("HabitUtils", () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(Date.UTC(2024, 9, 3, 12, 0, 0)));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe("getPeriodKey", () => {
        describe("daily", () => {
            it("should get daily period key", () => {
                const date = new Date("2024-09-03");
                expect(getPeriodKey("daily", date)).toBe("2024-09-03");
            });

            it("should get daily period key for Jan", () => {
                const date = new Date("2024-01-01");
                expect(getPeriodKey("daily", date)).toBe("2024-01-01");
            });

            it("should get daily period key for NewYears", () => {
                const date = new Date("2024-12-31");
                expect(getPeriodKey("daily", date)).toBe("2024-12-31");
            });
        });

        describe("weekly", () => {
            it("should get period key", () => {
                const date = new Date("2024-09-03");
                expect(getPeriodKey("weekly", date)).toBe("2024-W36");
            });

            const expected = "2024-W36";
            const dates = [
                new Date("2024-09-02"), // monday
                new Date("2024-09-03"),
                new Date("2024-09-04"),
                new Date("2024-09-05"),
                new Date("2024-09-06"),
                new Date("2024-09-07"),
                new Date("2024-09-08") // sunday
            ];
            for (const date of dates) {
                it(`should be same period key through Mon-Sun [${date.toLocaleDateString()}]`, () => {
                    expect(getPeriodKey("weekly", date)).toBe(expected);
                });
            }

            it("should get weekly period key for Jan", () => {
                const date = new Date("2024-01-01");
                expect(getPeriodKey("weekly", date)).toBe("2024-W1");
            });

            it("should get weekly period key for NewYears", () => {
                const date = new Date("2024-12-31");
                expect(getPeriodKey("weekly", date)).toBe("2024-W53");
            });

            it("should get weekly period key for next year in same week", () => {
                const date = new Date("2025-01-02");
                expect(getPeriodKey("weekly", date)).toBe("2025-W1");
            });
        });

        describe("monthly", () => {
            it("should get a monthly period key", () => {
                const date = new Date("2024-09-03");
                expect(getPeriodKey("monthly", date)).toBe("2024-9");
            });

            it("should get monthly period key for Jan", () => {
                const date = new Date("2024-01-01");
                expect(getPeriodKey("monthly", date)).toBe("2024-1");
            });

            it("should get monthly period key for NewYears", () => {
                const date = new Date("2024-12-31");
                expect(getPeriodKey("monthly", date)).toBe("2024-12");
            });
        });

        it("should throw for a finite frequency", () => {
            const date = new Date("2024-09-03");
            expect(() => getPeriodKey("finite", date)).toThrow();
        });
    });

    describe("generatePeriods", () => {
        const date = new Date("2024-09-03");
        it("should generate 5 days", () => {
            const periods = generatePeriods("daily", date, 5);
            expect(periods).toHaveLength(5);
            const tests = ["2024-08-30", "2024-08-31", "2024-09-01", "2024-09-02", "2024-09-03"];
            for (let i = 0; i < tests.length; i++) {
                expect(periods[i].period).toBe(tests[i]);
            }
        });

        it("should generate 5 weeks", () => {
            const periods = generatePeriods("weekly", date, 5);
            expect(periods).toHaveLength(5);
            const tests = ["2024-W32", "2024-W33", "2024-W34", "2024-W35", "2024-W36"];
            for (let i = 0; i < tests.length; i++) {
                expect(periods[i].period).toBe(tests[i]);
            }
        });

        it("should generate 5 months", () => {
            const periods = generatePeriods("monthly", date, 5);
            expect(periods).toHaveLength(5);
            const tests = ["2024-5", "2024-6", "2024-7", "2024-8", "2024-9"];
            for (let i = 0; i < tests.length; i++) {
                expect(periods[i].period).toBe(tests[i]);
            }
        });

        it("should generate 12 months from last day", () => {
            const lastDayOfYear = new Date(Date.UTC(2024, 11, 31)); // Using UTC to avoid time zone issues
            const periods = generatePeriods("monthly", lastDayOfYear, 12);
            expect(periods).toHaveLength(12);
            for (let i = 0; i < periods.length; i++) {
                expect(periods[i].period).toBe(`2024-${i + 1}`);
            }
        });
    });
});
