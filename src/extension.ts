import * as vscode from 'vscode';
import { parseFile } from './testFileParser';
import * as runner from './runner';
import { ITestClass, ITestCase, ETestStatus } from './Interfaces';

export function activate(context: vscode.ExtensionContext) {
    const testCtrl = vscode.tests.createTestController('confirmaTestControler', "Confirma");
    context.subscriptions.push(testCtrl);

    const discoverTests = async () => {
        const testFiles = await vscode.workspace.findFiles('**/*.cs','{**/.godot/**,**/addons/**}');

        for (const file of testFiles) {
            const document = await vscode.workspace.openTextDocument(file);
            const testClasses = parseFile(document.getText());

            for (const testClass of testClasses) {
                const classItem = testCtrl.createTestItem(testClass.className, testClass.className, file);
                                testCtrl.items.add(classItem);

                for (const testCase of testClass.tests) {
                    const testItem = testCtrl.createTestItem(testCase.itemName, testCase.itemName, file);
                    classItem.children.add(testItem);
                }
            }
        }
    };

    //Discover tests on activation
    discoverTests();

    //Watch for changes in the workspace
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.cs');
    fileWatcher.onDidChange(discoverTests);
    fileWatcher.onDidCreate(discoverTests);
    fileWatcher.onDidDelete(discoverTests);

    context.subscriptions.push(fileWatcher);

    testCtrl.createRunProfile(
        'Run Tests',
        vscode.TestRunProfileKind.Run,
        async (request,token) => {await runner.testConfigurationRun(request,token,testCtrl);},
        true);
}

export function deactivate() {}