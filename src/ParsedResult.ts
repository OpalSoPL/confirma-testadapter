import { Debug } from "./debug";
import { ITestClass } from "./interfaces/ITestClass";
import { ITestCase } from "./interfaces/ITestCase";

export class ParsedResult {
    passed:number = 0; //place for future features
    ignored:number = 0;
    warnings:number = 0;
    failed:IFailed;
    testedClasses:ITestClass[] = [];
    debug:Debug|undefined  = undefined;

    constructor (passed:number, ignored:number, warnings:number, failed:IFailed, Classes:ITestClass[])
    {
        this.passed = passed;
        this.ignored = ignored;
        this.warnings = warnings;
        this.failed = failed;
        this.testedClasses = Classes;
    }

    sum(b:ParsedResult)
    {
        this.passed += b.passed;
        this.ignored += b.ignored;
        this.warnings += b.warnings;
        b.testedClasses.forEach(V => {
            this.testedClasses.push(V);
        });
        b.failed.map.forEach((V,K) => {
            this.failed.map.set(K,V);
        });
    }
}

export interface IFailed {
    count:number,
    map:Map<ITestCase,string>
}