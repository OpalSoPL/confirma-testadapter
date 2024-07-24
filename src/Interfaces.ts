//todo move to TestTree.ts or sth
export interface ITestClass {
    className:string,
    tests:ITestCase[]
}

export interface ITestCase {
    itemName:string,
    status:ETestStatus
    args?:string | undefined;
}

export enum ETestStatus {
    Passed,
    Failed,
    Ignored,
    Unknown
}