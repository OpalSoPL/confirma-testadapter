import * as vscode from 'vscode';
import { CsParseFile } from './cs/CsTestFileParser';
import { GdParseFile } from './gd/GdTestFileParser';

export const discoverTests = async () => {
    const testFiles = await vscode.workspace.findFiles('{**/*.cs,**/*.gd}','{**/.godot/**,**/addons/**}');

    for (const file of testFiles) {
        const document = await vscode.workspace.openTextDocument(file);

        switch (document.languageId) {
            case "csharp":
                CsParseFile(document.fileName);
                break;
            case "gdscript":
            case "plaintext":
                GdParseFile(document.getText());
                break;
            default:
        }
        // const testClasses = parseFile(document.getText());

        // for (const testClass of testClasses) {
        //     const classItem = testCtrl.createTestItem(testClass.className, testClass.className, file);
        //                     testCtrl.items.add(classItem);

        //     for (const testCase of testClass.tests) {
        //         const testItem = testCtrl.createTestItem(testCase.itemName, testCase.itemName, file);
        //         classItem.children.add(testItem);
        //     }
        // }
    }
};