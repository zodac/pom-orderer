import * as vscode from "vscode";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

const ORDER = [
  "modelVersion","parent","groupId","artifactId","version","packaging",
  "name","description","url","inceptionYear","organization","licenses",
  "developers","contributors","mailingLists","prerequisites","modules",
  "scm","issueManagement","ciManagement","distributionManagement","properties",
  "dependencyManagement","dependencies","repositories","pluginRepositories",
  "build","reporting","profiles"
];

/**
 * Reorder a pom.xml string according to ORDER
 */
function reorderPom(xmlText: string): string {
  const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });
  const parsed = parser.parse(xmlText);

  const projectIndex = parsed.findIndex((node: any) => node.hasOwnProperty("project"));
  if (projectIndex === -1) {
    return xmlText;
  }

  const projectNode = parsed[projectIndex].project;

  const orderedChildren: any[] = [];
  for (const key of ORDER) {
    const idx = projectNode.findIndex((child: any) => child.hasOwnProperty(key));
    if (idx !== -1) {
      orderedChildren.push(projectNode[idx]);
    }
  }
  for (const child of projectNode) {
    const name = Object.keys(child)[0];
    if (!ORDER.includes(name)) {
      orderedChildren.push(child);
    }
  }

  parsed[projectIndex].project = orderedChildren;

  const builder = new XMLBuilder({ ignoreAttributes: false, preserveOrder: true, format: true, indentBy: "  " });
  return builder.build(parsed);
}

/**
 * Main listener function for auto-save
 */
export function onWillSaveDocument(event: vscode.TextDocumentWillSaveEvent) {
  const document = event.document;
  if (!document.fileName.endsWith("pom.xml")) {
    return;
  }

  const xmlText = document.getText();
  const newXml = reorderPom(xmlText);

  if (newXml !== xmlText) {
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(xmlText.length)
    );
    event.waitUntil(Promise.resolve([vscode.TextEdit.replace(fullRange, newXml)]));
  }
}

/**
 * Command for Command Palette
 */
async function reorderActivePom() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const document = editor.document;
  if (!document.fileName.endsWith("pom.xml")) {
    return;
   }

  const xmlText = document.getText();
  const newXml = reorderPom(xmlText);

  if (newXml !== xmlText) {
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(xmlText.length)
    );
    await editor.edit(editBuilder => editBuilder.replace(fullRange, newXml));
    vscode.window.showInformationMessage("pom.xml reordered!");
  }
}

/**
 * VS Code activation
 */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument(onWillSaveDocument),
    vscode.commands.registerCommand("pom-orderer.reorderPom", reorderActivePom)
  );
}

export function deactivate() {}
