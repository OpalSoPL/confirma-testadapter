//todo move to TestTree.ts or sth
export interface ITestClass {
    className:string,
    tests:ITestCase[]
}

export interface ITestCase {
    itemName:string,
    status:ETestStatus
}

export enum ETestStatus {
    Passed,
    Failed,
    Ignored,
    Unknown
}