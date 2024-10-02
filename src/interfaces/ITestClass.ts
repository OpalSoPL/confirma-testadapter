import { ITestCase } from "./ITestCase";

export interface ITestClass {
    className: string;
    tests: ITestCase[];
}
