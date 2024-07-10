const TerminalInfoRe = /^[0-9]+ passed, [0-9]+ failed, [0-9]+ ignored, [0-9]+ warnings/;
const TerminalClsRe =  /^\> [A-Za-z]+\.\.\./ ;
const TerminalItemResultRe = /^\| [A-Za-z]+\.\.\. (passed | failed)/;


const classHeader = "[TestClass]";
const itemHeader = "[TestCase]";

const CSharpClassNameRe = /^(?!(\/\/|\/\*))[^\r\n]*\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*{/gm;

const text = `
//class IgnoredClass {}
/* 
  class AnotherIgnoredClass {}
*/
public class MyClass {
}

// class IgnoredInSingleLineComment {}

/* class
   IgnoredInMultiLineComment {}
*/

public class ValidClass {
}
`;

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "confirma-testadapter" is now active!');

    const disposable = vscode.commands.registerCommand('confirma-testadapter.helloWorld', () => {
        let match;
        while ((match = CSharpClassNameRe.exec(text)) !== null) {
            console.info(match[2]);
        }

    context.subscriptions.push(disposable);
	});
}

export function deactivate() {}