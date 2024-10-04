import * as vscode from 'vscode';
import * as runner from './runner';
import { TestController } from './TestController';

export function activate(context: vscode.ExtensionContext) {

    var controller = new TestController(context);
    //Discover tests on activation
    controller.discoverTests();

    //Watch for changes in the workspace
    const fileWatcher = vscode.workspace.createFileSystemWatcher('{**/*.cs, **/*.gd}');

    fileWatcher.onDidChange((uri) => controller.discoverTests()); //todo create new method `changeTest`
    fileWatcher.onDidCreate((uri) => controller.discoverTests()); //todo create new method `addTest`
    fileWatcher.onDidDelete((uri) => controller.discoverTests()); //todo create new method `removeTest`

    context.subscriptions.push(fileWatcher);
}

export function deactivate() {}