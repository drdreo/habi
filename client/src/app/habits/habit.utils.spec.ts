import { generatePeriods, getPeriodKey } from "./habit.utils";

describe("HabitUtils", () => {
    describe("getPeriodKey", () => {
        let date: Date;

        beforeEach(() => {
            date = new Date("2024-09-03");
        });

        describe("daily", () => {
            it("should get daily period key", () => {
                expect(getPeriodKey("daily", date)).toBe("2024-09-03");
            });

            it("should get daily period key for Jan", () => {
                date = new Date("2024-01-01");
                expect(getPeriodKey("daily", date)).toBe("2024-01-01");
            });

            it("should get daily period key for NewYears", () => {
                date = new Date("2024-12-31");
                expect(getPeriodKey("daily", date)).toBe("2024-12-31");
            });
        });

        describe("weekly", () => {
            it("should get weekly period key", () => {
                expect(getPeriodKey("weekly", date)).toBe("2024-W36");
            });

            it("should get weekly period key for Jan", () => {
                date = new Date("2024-01-01");
                expect(getPeriodKey("weekly", date)).toBe("2024-W1");
            });

            it("should get weekly period key for NewYears", () => {
                date = new Date("2024-12-31");
                expect(getPeriodKey("weekly", date)).toBe("2024-W53");
            });

            it("should get weekly period key for next year in same week", () => {
                date = new Date("2025-01-02");
                expect(getPeriodKey("weekly", date)).toBe("2025-W1");
            });
        });

        describe("monthly", () => {
            it("should get a monthly period key", () => {
                expect(getPeriodKey("monthly", date)).toBe("2024-9");
            });

            it("should get monthly period key for Jan", () => {
                date = new Date("2024-01-01");
                expect(getPeriodKey("monthly", date)).toBe("2024-1");
            });

            it("should get monthly period key for NewYears", () => {
                date = new Date("2024-12-31");
                expect(getPeriodKey("monthly", date)).toBe("2024-12");
            });
        });

        it("should throw for a finite frequency", () => {
            expect(() => getPeriodKey("finite", date)).toThrow();
        });
    });

    describe("generateLastFivePeriods", () => {
        const date = new Date("2024-09-03");
        it("should generate 5 days", () => {
            const periods = generatePeriods("daily", date, 5);
            expect(periods).toHaveLength(5);
            expect(periods[0].period).toBe("2024-09-03");
            expect(periods[1].period).toBe("2024-09-02");
            expect(periods[2].period).toBe("2024-09-01");
            expect(periods[3].period).toBe("2024-08-31");
            expect(periods[4].period).toBe("2024-08-30");
        });

        it("should generate 5 weeks", () => {
            const periods = generatePeriods("weekly", date, 5);
            expect(periods).toHaveLength(5);
            expect(periods[0].period).toBe("2024-W36");
            expect(periods[1].period).toBe("2024-W35");
            expect(periods[2].period).toBe("2024-W34");
            expect(periods[3].period).toBe("2024-W33");
            expect(periods[4].period).toBe("2024-W32");
        });

        it("should generate 5 months", () => {
            const periods = generatePeriods("monthly", date, 5);
            expect(periods).toHaveLength(5);
            expect(periods[0].period).toBe("2024-9");
            expect(periods[1].period).toBe("2024-8");
            expect(periods[2].period).toBe("2024-7");
            expect(periods[3].period).toBe("2024-6");
            expect(periods[4].period).toBe("2024-5");
        });

        it("should generate 12 months from last day", () => {
            const lastDayOfYear = new Date(1733007600000);
            const periods = generatePeriods("monthly", lastDayOfYear, 12);
            expect(periods).toHaveLength(12);
            expect(periods[0].period).toBe("2024-12");
            expect(periods[1].period).toBe("2024-11");
            expect(periods[2].period).toBe("2024-10");
            expect(periods[3].period).toBe("2024-9");
            expect(periods[4].period).toBe("2024-8");
            expect(periods[5].period).toBe("2024-7");
            expect(periods[6].period).toBe("2024-6");
        });
    });
});
