import chalk, { Color } from "chalk";

export function loadingBar(percentage: number, color: typeof Color = "green", includePercentage: boolean = true) {
    return `[${chalk[color]("\u2591").repeat(Math.floor(percentage * 10))
        + "\u2591".repeat(10 - Math.floor(percentage * 10))}] ` +
        `${includePercentage ? `(${(percentage * 100).toFixed(2)}%)` : ""}`;
}