//todo move to separate files
export interface ITestClass {
    className:string,
    tests:ITestCase[]
}

export interface ITestCase {
    itemName:string,
    status?:ETestStatus
    args?:string | undefined;
}

export enum ETestStatus {
    Passed,
    Failed,
    Ignored,
    Unknown
}

export enum ETestType {
    All,
    Class,
    Method
}