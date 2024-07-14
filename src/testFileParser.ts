import { ITestClass } from "./Interfaces";

const CSharpClassNameRe = /\bclass\s+([a-zA-Z0-9_]+)\b/;
const CSharpMethodNameRe = /\b(public|private|internal|protected|void)\s*s*\b(async)?\s*\b(static|virtual|abstract|void)?\s*\b(async)?\b(Task)?\s*[a-zA-Z]*(?<method>\s[A-Za-z_][A-Za-z_0-9]*\s*)\((([a-zA-Z\[\]\<\>]*\s*[A-Za-z_][A-Za-z_0-9]*\s*)[,]?\s*)+\)/

const classHeader = /^\[TestClass\]/;
const itemHeader = /^\[TestCase\]/;

export const parseFile = (text: string) => {
    //console.info(text);
    let testClassFlag = false;
    let testCaseFlag = false;

    let TestClasses: ITestClass[];

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
            console.info(1);
        }
        //console.info(testClassFlag,lineNo);

        const classMatch = line.match(CSharpClassNameRe);
        if (classMatch && testClassFlag) {
            let className = classMatch[1];
        }
    }
};