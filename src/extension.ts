import * as vscode from "vscode";

// TODO: Split out the pom-sorting logic from the VScode extension logic, then test

// Desired order of pom.xml elements
const ORDER = [
  "modelVersion","parent","groupId","artifactId","version","packaging",
  "name","description","url","inceptionYear","organization","licenses",
  "developers","contributors","mailingLists","prerequisites","modules",
  "scm","issueManagement","ciManagement","distributionManagement","properties",
  "dependencyManagement","dependencies","repositories","pluginRepositories",
  "build","reporting","profiles",
];

/**
 * Reorder <project> children while preserving whitespace
 */
function reorderPomPreserveWhitespace(xmlText: string): string {
  // Match the <project>...</project> block
  const projectMatch = xmlText.match(/<project\b[^>]*>([\s\S]*?)<\/project>/);
  if (!projectMatch) {
    return xmlText;
  }

  const projectContent = projectMatch[1];

  // Match all top-level elements inside <project> (including whitespace)
  const childRegex = /(\s*<(\w+)[^>]*>[\s\S]*?<\/\2>)/g;
  const children: Array<{ name: string; text: string }> = [];
  let match;
  while ((match = childRegex.exec(projectContent)) !== null) {
    const text = match[1];
    const name = match[2];
    children.push({ name, text });
  }

  // Separate into ordered and unordered children
  const orderedChildren: string[] = [];
  const unorderedChildren: string[] = [];

  for (const key of ORDER) {
    for (const child of children) {
      if (child.name === key) {
        orderedChildren.push(child.text);
      }
    }
  }
  for (const child of children) {
    if (!ORDER.includes(child.name)) {
      unorderedChildren.push(child.text);
    }
  }

  const newProjectContent = orderedChildren.concat(unorderedChildren).join("");

  // Replace old project content
  return xmlText.replace(projectMatch[1], newProjectContent);
}

/**
 * Main listener function for auto-save
 */
export function onWillSaveDocument(event: vscode.TextDocumentWillSaveEvent): void {
  const document = event.document;
  if (!document.fileName.endsWith("pom.xml")) {
    return;
  }

  const xmlText = document.getText();
  const newXml = reorderPomPreserveWhitespace(xmlText);

  if (newXml !== xmlText) {
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(xmlText.length),
    );
    event.waitUntil(Promise.resolve([vscode.TextEdit.replace(fullRange, newXml)]));
  }
}

/**
 * Command for Command Palette
 */
async function reorderActivePom(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  if (!document.fileName.endsWith("pom.xml")) {
    return;
  }

  const xmlText = document.getText();
  const newXml = reorderPomPreserveWhitespace(xmlText);

  if (newXml !== xmlText) {
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(xmlText.length),
    );
    await editor.edit(editBuilder => editBuilder.replace(fullRange, newXml));
    vscode.window.showInformationMessage("pom.xml reordered!");
  }
}

/**
 * VS Code activation
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument(onWillSaveDocument),
    vscode.commands.registerCommand("pom-orderer.reorderPom", reorderActivePom),
  );
}

export function deactivate(): void {}
