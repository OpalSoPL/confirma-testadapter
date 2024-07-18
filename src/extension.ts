import * as vscode from 'vscode';
import { parseFile } from './testFileParser';
import * as runner from './runner';
import { ITestClass, ITestCase, ETestStatus } from './Interfaces';

export function activate(context: vscode.ExtensionContext) {
    const testCtrl = vscode.tests.createTestController('confirmaTestControler', "Confirma");
    context.subscriptions.push(testCtrl);

    let workspacePath = "";
    if (vscode.workspace.workspaceFolders !== undefined) {
        workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
    }

    const discoverTests = async () => {
        const testFiles = await vscode.workspace.findFiles('**/*.cs');

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

    //create instance of testrunner
    const testRunner = new runner.TestRunner();

    context.subscriptions.push(fileWatcher);

    testCtrl.createRunProfile(
        'Run Tests',
        vscode.TestRunProfileKind.Run,
        async (request, token) => {
            const run = testCtrl.createTestRun(request);

            //build project
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "build in progress",
                cancellable: true
            },
            () => {
                return testRunner.build(workspacePath)
                    .then(status => {
                        if (!status) {
                            vscode.window.showErrorMessage("build error");
                            run.end();
                            return;
                        }
                    });
            });

            
            request.include?.forEach(test => {
                run.started(test);
                run.passed(test); //do nothing
            });
            run.end();
        },
        true
    );
}

export function deactivate() {}