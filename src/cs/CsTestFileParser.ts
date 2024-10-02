import { ITestClass } from "../interfaces/ITestClass";
import { ITestCase } from "../interfaces/ITestCase";
import { ETestStatus } from "../enums/ETestStatus";
import { ECurrentFlag } from "../enums/ECurrentFlag";

const ClassNameRe = /\bclass\s+(\w+)/;
const MethodNameRe = /\bpublic\s+(async\s+)?(static|virtual|abstract|void)?\s*(async\s+)?(Task\s+)?((?!class))([(\w)|void]+)\s(?<method>\w+)/;

const classHeader = /\[TestClass\]/;
const itemHeader = /\[TestCase(\(([A-z0-9\)\(\?\[\]\s\{\},"'-][^\n]*)\))*\]/;

let currentFlag: ECurrentFlag = ECurrentFlag.None;

export const CsParseFile = (text: string): ITestClass[] => {

    let TestClasses: ITestClass[] = [];

    const lines = text.split('\n');

    for (const line of lines) {

        //check for attributes
        if (itemHeader.test(line)) {
            currentFlag = ECurrentFlag.TestCase;
        }

        if (classHeader.test(line)) {
            currentFlag = ECurrentFlag.TestClass;
        }

        const classMatch = line.match(ClassNameRe);
        if (classMatch && flagIsEqual(ECurrentFlag.TestClass)) {
            let className = classMatch[1];

            TestClasses.push({className, tests: []});
            continue;
        }

        const itemMatch = line.match(MethodNameRe);
        if (itemMatch && flagIsEqual(ECurrentFlag.TestCase) && TestClasses.length > 0) {

            if (itemMatch.groups) {
                let itemName = itemMatch.groups.method;
                let newItem : ITestCase =  {itemName};
                TestClasses[TestClasses.length-1].tests.push(newItem);
            }
        }
        clearFlag();
    }
    return TestClasses;
};

function flagIsEqual(value: ECurrentFlag): boolean {
    return currentFlag === value;
}

function clearFlag (): void {
    currentFlag = ECurrentFlag.None;
}