const vscode         = require('vscode');
const fs             = require('fs');
const path           = require('path');
const childProcess   = require('child_process');
const diffMatchPatch = require('diff-match-patch');

class AstyleFormatter {
    // interface required by vscode.DocumentFormattingEditProvider
    provideDocumentFormattingEdits(document, options, token) {
        return new Promise((resolve, reject) => {
            let astyleBinPath = "D:\\AStyle.exe";
            let args = [];
            let astyle = childProcess.spawn(astyleBinPath, args);
            let out = "", err = "";

            astyle.stdin.write(document.getText());
            astyle.stdin.end();

            astyle.stdout.on('data', (data) => {
                out += data;
            });

            astyle.stderr.on('data', (data) => {
                err += data;
            });

            astyle.on('close', (code) => {
                if (code !== 0) {
                    reject('Failed to format file. (code: ' + code + ', reason: ' + err + ')');
                } else {
                    resolve(this.generateTextEditors(document, out));
                }
            });

            astyle.on('error', (err) => {
                if (err.code == 'ENOENT') {
                    vscode.window.showErrorMessage('Can\'t found astyle.');
                } else {
                    vscode.window.showErrorMessage('Failed to launch astyle. (code: ' + err.code + ')');
                }

                reject(err);
            });
        });
    }

    generateTextEditors(document, formattedText) {
        let dmp = new diffMatchPatch.diff_match_patch();
        let diffs = dmp.diff_main(document.getText(), formattedText);
        let editors = [];
        let line = 0, character = 0;

        diffs.forEach((diff) => {
            let op = diff[0];
            let text = diff[1];
            let start = new vscode.Position(line, character);

            for(let c of text) {
                if (c === '\n') {
                    character = 0;
                    line++;
                } else {
                    character++;
                }
            }

            switch(op) {
                case diffMatchPatch.DIFF_INSERT:
                    editors.push(vscode.TextEdit.insert(start, text));
                    // this new part should not affect counting of original document
                    character = start.character;
                    line = start.line;
                    break;
                case diffMatchPatch.DIFF_DELETE:
                    let end = new vscode.Position(line, character);
                    editors.push(vscode.TextEdit.delete(new vscode.Range(start, end)));
                    break;
                case diffMatchPatch.DIFF_EQUAL:
                    break;
            }
        });

        return editors;
    }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let formatter = new AstyleFormatter();

    ["cpp", "c", "objective-c", "csharp", "java"].forEach(function(language) {
        let disposable = vscode.languages.registerDocumentFormattingEditProvider(language, formatter);
        context.subscriptions.push(disposable);
    });
}

exports.activate = activate;