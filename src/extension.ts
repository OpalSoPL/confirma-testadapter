const CSharpClassNameRe = /^(?!(\/\/|\/\*))[^\r\n]*\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*{/gm;

const classHeader = "[TestClass]";
const itemHeader = "[TestCase]";

const text = `
Godot Engine v4.2.2.stable.mono.official.15073afe3 - https://godotengine.org
 
/root/ActionHandler
/root/ActionHandler
/root/ActionHandler
/root/ActionHandler
/root/ActionHandler
/root/ActionHandler
> BlablaTest...
| Idk... failed.
- Expected 8 to be within the range [1, 5].
| Idk1... passed.
| Idk2... passed.
> AnotherTest...
| Test... passed.

Confirma ran 3 tests in 1 test classes. Tests took 0,0460924s.
2 passed, 1 failed, 0 ignored, 0 warnings.
WARNING: ObjectDB instances leaked at exit (run with --verbose for details).
     at: cleanup (core/object/object.cpp:2209)
`;

import * as vscode from 'vscode';
import { parseResult } from './testResultParser';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "confirma-testadapter" is now active!');

    const disposable = vscode.commands.registerCommand('confirma-testadapter.helloWorld', () => {
        const result = parseResult(text);
        vscode.window.showInformationMessage(`Test results: ${result.passed} passed, ${result.failed} failed, ${result.ignored} ignored, ${result.warnings} warnings.`
            );
        result.testedClasses.forEach(element => {
            console.info(`> ${element.className}`);

            element.tests.forEach(element => {
                console.info(`| ${element.itemName}:${element.status}`);
            });
        });
    context.subscriptions.push(disposable);
	});
}

export function deactivate() {}