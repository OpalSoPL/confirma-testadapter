import { ETestStatus, ITestCase, ITestClass } from "./Interfaces";
import * as vscode from 'vscode';

const CSharpClassNameRe = /\bclass\s+([a-zA-Z0-9_]+)\b/;
const CSharpMethodNameRe = /\bpublic\s+(async\s+)?(static|virtual|abstract|void)?\s*(async\s+)?(Task\s+)?((?!class))([a-zA-Z|void]+)\s(?<method>[A-Za-z_][A-Za-z_0-9]+)/;

const classHeader = /\[TestClass\]/;
const itemHeader = /\[TestCase\]/;

export const parseFile = (text: string) => {
    //console.info(text);
    let testClassFlag = false;
    let testCaseFlag = false;

    let TestClasses: ITestClass[] = [];

    const lines = text.split('\n');

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo].trim();

        //check for atributes
        const itemAtributeMatch = line.match(itemHeader);
        if (itemAtributeMatch) {
            testCaseFlag =  true;
        }

        const classAtributeMatch = line.match(classHeader);
        if (classAtributeMatch) {
            testClassFlag = true;
        }
        //console.info(testClassFlag,lineNo);

        const classMatch = line.match(CSharpClassNameRe);
        if (classMatch && testClassFlag) {
            let className = classMatch[1];
            let newClass: ITestClass = {className, tests: []};

            TestClasses.push(newClass);
            testClassFlag = false;
            continue;
        }

        const itemMatch = line.match(CSharpMethodNameRe);
        if (itemMatch && testCaseFlag && TestClasses.length > 0) {

            let itemName;
            if (itemMatch.groups) {
                    itemName = itemMatch.groups.method;
                }
            else {
                itemName = "";
            }

            let newitem : ITestCase =  {itemName};

            TestClasses[TestClasses.length-1].tests.push(newitem);
        }
    }
    return TestClasses;
};