import { ITestClass } from "../interfaces/ITestClass";
import { ITestCase } from "../interfaces/ITestCase";
import { ETestStatus } from "../enums/ETestStatus";

export const GdParseFile = (text: string): ITestClass | undefined => {
    const TestClassRe = /class_name(\s)+(?<className>\w+)(\s)+extends TestClass/m;
    const TestMethodRe = /func(\s)*(?<methodName>\w+)(\s)*\b\(\)/mg;

    var testClass = TestClassRe.exec(text);

    if (!testClass) {
        return;
    }

    if (!testClass.groups) {
        return;
    }

    const className = testClass.groups.className;

    const TestFile: ITestClass = {className, tests: []};

    let match;
    while ((match = TestMethodRe.exec(text)) !== null) {
        if (!match.groups) {
            continue;
        }
        const testItem: ITestCase = {itemName: match.groups.methodName};
        TestFile.tests.push(testItem);
    }
    return TestFile;
};