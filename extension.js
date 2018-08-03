const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const diffMatchPatch = require('diff-match-patch');

class AstyleFormatter {
    constructor() {
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }

    getFilesizeInBytes(filename) {
        const stats = fs.statSync(filename)
        const fileSizeInBytes = stats.size
        return fileSizeInBytes
    }

    // interface required by vscode.DocumentFormattingEditProvider
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return new Promise((resolve, reject) => {
            let astyleBinPath = vscode.workspace.getConfiguration('astyle')['executable'] || 'astyle';
            let astyleRcPath = vscode.workspace.getConfiguration('astyle')['astylerc'];
            const astyleMaxBufferMultiplier = vscode.workspace.getConfiguration('astyle')['max_buffer_multipler'];
            let args = vscode.workspace.getConfiguration('astyle')['cmd_options'] || [];

            if (astyleRcPath) {
                args.push("--options=" + astyleRcPath);
            }

            args.forEach((item, index) => {
                args[index] = item.replace(/(\${workspaceRoot})|(\${workspaceFolder})/g, vscode.workspace.rootPath);
            });

            astyleBinPath = astyleBinPath.replace(/(\${workspaceRoot})|(\${workspaceFolder})/g, vscode.workspace.rootPath);
            
            const defaultMaxBufferSize = 200 * 1024;
            const maxBufferMultiplierSize = this.getFilesizeInBytes(document.fileName) * astyleMaxBufferMultiplier;
            // Assume that the formatting/expansion of the document could double it's size
            // Make sure the minimum size is still the default for execFile::maxBuffer
            const maxBufferSize = Math.max(defaultMaxBufferSize, maxBufferMultiplierSize);

            let astyle = childProcess.execFile(astyleBinPath, args, {maxBuffer: maxBufferSize}, (err, stdout, stderr) => {
                if (err && err.code == 'ENOENT') {
                    vscode.window.showErrorMessage('Can\'t find astyle. (' + astyleBinPath + ')');
                    reject(null);
                    return;
                }

                if (err) {
                    vscode.window.showErrorMessage('Failed to launch astyle. (reason: "' + stderr.split(/\r\n|\r|\n/g).join(',') + ' ' + err + '")');
                    reject(null);
                    return;
                }

                let editors = this.generateTextEditors(document, stdout, range);
                this.updateStatusBar(editors);
                resolve(editors);
            });

            if (astyle.pid) {
                astyle.stdin.write(document.getText());
                astyle.stdin.end();
            }
        });
    }

    generateTextEditors(document, formattedText, range) {
        let dmp = new diffMatchPatch.diff_match_patch();
        let diffs = dmp.diff_main(document.getText(), formattedText.replace(/\r\n|\r|\n/g, document.eol == 2 ? '\r\n' : '\n'));
        let editors = [];
        let line = 0, character = 0;

        diffs.forEach((diff) => {
            let op = diff[0];
            let text = diff[1];
            let start = new vscode.Position(line, character);
            let lines = text.split(/\r\n|\r|\n/g);

            line += lines.length - 1;

            if (lines.length > 1) {
                character = lines[lines.length - 1].length;
            } else if (lines.length == 1) {
                character += lines[0].length;
            }

            switch (op) {
                case diffMatchPatch.DIFF_INSERT:
                    if(range.start.line <= line && range.end.line >= line)
                        editors.push(vscode.TextEdit.insert(start, text));
                    // this new part should not affect counting of original document
                    line = start.line;
                    character = start.character;
                    break;
                case diffMatchPatch.DIFF_DELETE:
                    let end = new vscode.Position(line, character);
                    if(range.start.line <= line && range.end.line >= line)
                        editors.push(vscode.TextEdit.delete(new vscode.Range(start, end)));
                    break;
                case diffMatchPatch.DIFF_EQUAL:
                    break;
            }
        });

        return editors;
    }

    updateStatusBar(editors) {
        if (editors.length == 0) {
            this.statusBar.text = 'No changes';
        } else {
            this.statusBar.text = '$(pencil) Formatted';
        }

        this.statusBar.show();

        setTimeout(() => {
            this.statusBar.hide();
        }, 500);
    }

    dispose() {
        this.statusBar.dispose();
    }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let formatter = new AstyleFormatter();
    let additionalLanguages = vscode.workspace.getConfiguration('astyle')['additional_languages'] || [];

    ["c", "cpp", "objective-c", "csharp", "java"].concat(additionalLanguages).forEach(function (language) {
        let config = vscode.workspace.getConfiguration('astyle')[language];

        if (config && !config.enable) {
            return;
        }

        let disposable = vscode.languages.registerDocumentRangeFormattingEditProvider(language, formatter);
        context.subscriptions.push(disposable);
    });

    context.subscriptions.push(formatter);
}

exports.activate = activate;
