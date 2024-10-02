
import * as vscode from 'vscode';
import { CsParseFile } from './cs/CsTestFileParser';
import * as runner from './runner';
import { ITestClass } from "./interfaces/ITestClass";
import { ITestCase } from "./interfaces/ITestCase";
import { ETestStatus } from "./enums/ETestStatus";
import { discoverTests } from './DiscoverTests';

export function activate(context: vscode.ExtensionContext) {
    const testCtrl = vscode.tests.createTestController('confirmaTestControler', "Confirma");
    context.subscriptions.push(testCtrl);


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