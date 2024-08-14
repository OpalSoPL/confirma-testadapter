import { ITestClass } from "./Interfaces";

export class Debug
{
    methodCount:number;
    classCount:number;

    constructor (classes:ITestClass[])
    {
        this.classCount= 0, this.methodCount = 0;
        classes.forEach(value => {
            this.classCount++;
            value.tests.forEach(value => {
                this.methodCount++;
            });
        });
    }
}