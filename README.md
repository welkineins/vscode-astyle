# VSCode Astyle Format

This extension allows you to run Artistic Style(Astyle) on Visual Studio Code to format C/C++/Objective-C/C#/Java code.

## Installation

Open the command palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> or <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) and run the following command:

```bash
ext install vscode-astyle
```

## How to Start

1. Download Astyle from http://astyle.sourceforge.net/. (On Linux, you can use apt-get)
1. Prepare your style by editing astylerc and put it in the search path. (see the link first: http://astyle.sourceforge.net/astyle.html#_Option_Files)
1. Make sure the Astyle executable is in your system $PATH or add path to configration. 
1. Enable supported languages in configration. (C and C++ are enabled by default)
1. When you open a supported language file, you can find 'Format' in context menu or just use the shortcut <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd>.

## Configuration

- `astyle.astylerc`: specify path of astylerc file. ${workspaceRoot} is supported to enable using different astyle file between projects. e.g. '${workspaceRoot}/.vscode/astylerc'. (default: null, lookup astylerc in original order of astyle)
- `astyle.cmd_options`: array of command line options for astyle. (You should avoid conflicted options) For example: `["--indent=tab", "--break-blocks"]`
- `astyle.max_buffer_multipler`: multiplier to indicate how large an output buffer to allocate for the transformed source code file after Astyle processes it. (default: 2, assumes most formatting/whitespace expansion will result in less than a 2x increase in file size).
- `astyle.additional_languages`: array of additional languages to use astyle as code formatter. For example: `["haxe"]`. (You don't have to enable the language in astyle config)

## FAQ

- Q1. How to avoid conflict with ClangFormat in C/C++ package
- A1. VSCode is not support dominate code formatter but with scores, and it two formatter has same score, it choose the later one. However, in the latest version of C/C++ package, you can disable ClangFormat with options `"C_Cpp.formatting" : "disabled"`. (Thanks to @BillDenton notes.)

## Source code

Available on GitHub: https://github.com/welkineins/vscode-astyle

Issues on GitHub: https://github.com/welkineins/vscode-astyle/issues
