import * as vscode from 'vscode';
import * as runner from './runner';
import { TestController } from './TestController';

export function activate(context: vscode.ExtensionContext) {

    var controller = new TestController(context);
    //Discover tests on activation
    controller.discoverTests();

    //Watch for changes in the workspace
    const fileWatcher = vscode.workspace.createFileSystemWatcher('{**/*.cs, **/*.gd}');
    fileWatcher.onDidChange(controller.discoverTests);
    fileWatcher.onDidCreate(controller.discoverTests);
    fileWatcher.onDidDelete(controller.discoverTests);

    context.subscriptions.push(fileWatcher);
}

export function deactivate() {}