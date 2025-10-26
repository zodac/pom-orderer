import * as vscode from "vscode";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

// Desired order of pom.xml elements
const ORDER = [
  "modelVersion","parent","groupId","artifactId","version","packaging",
  "name","description","url","inceptionYear","organization","licenses",
  "developers","contributors","mailingLists","prerequisites","modules",
  "scm","issueManagement","ciManagement","distributionManagement","properties",
  "dependencyManagement","dependencies","repositories","pluginRepositories",
  "build","reporting","profiles"
];

/**
 * Main listener function for onWillSaveTextDocument.
 * Exported for testing.
 */
export async function onWillSaveDocument(event: vscode.TextDocumentWillSaveEvent) {
  const document = event.document;

  if (!document.fileName.endsWith("pom.xml")) {
    return;
  }

  const xmlText = document.getText();
  const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });
  const parsed = parser.parse(xmlText);

  // Find <project> node
  const projectIndex = parsed.findIndex((node: any) => node.hasOwnProperty("project"));
  if (projectIndex === -1) {
    return;
  }

  const projectNode = parsed[projectIndex].project;

  // Reorder direct children according to ORDER
  const orderedChildren: any[] = [];
  for (const key of ORDER) {
    const idx = projectNode.findIndex((child: any) => child.hasOwnProperty(key));
    if (idx !== -1) {
      orderedChildren.push(projectNode[idx]);
    }
  }

  // Keep any children not in the list at the end
  for (const child of projectNode) {
    const name = Object.keys(child)[0];
    if (!ORDER.includes(name)) {
      orderedChildren.push(child);
    }
  }

  parsed[projectIndex].project = orderedChildren;

  // Build new XML string
  const builder = new XMLBuilder({ ignoreAttributes: false, preserveOrder: true, format: true, indentBy: "  " });
  const newXml = builder.build(parsed);

  // Apply edit to the document
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(xmlText.length)
  );

  event.waitUntil(Promise.resolve([vscode.TextEdit.replace(fullRange, newXml)]));
}

/**
 * VS Code extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.workspace.onWillSaveTextDocument(onWillSaveDocument);
  context.subscriptions.push(disposable);
}

/**
 * VS Code extension deactivation
 */
export function deactivate() {}
