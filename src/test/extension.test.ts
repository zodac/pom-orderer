import * as assert from "assert";
import * as vscode from "vscode";
import { activate, deactivate, onWillSaveDocument } from "../extension";
import { XMLParser } from "fast-xml-parser";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Should not trigger for non-pom.xml files", async () => {
    const fakeDocument: any = {
      fileName: "README.md",
      getText: () => "Some text",
      positionAt: (offset: number) => new vscode.Position(0, offset),
    };

    let triggered = false;
    const fakeEvent: any = {
      document: fakeDocument,
      waitUntil: (promise: Promise<any>) => {
        triggered = true;
        return promise;
      },
    };

    // Simulate activation
    const context: any = { subscriptions: [] };
    activate(context);

    // Trigger event manually
    for (const sub of context.subscriptions) {
      if (typeof sub === "function") {
        sub(fakeEvent);
      } else if (sub && sub._listener) {
        sub._listener(fakeEvent);
      }
    }

    assert.strictEqual(triggered, false, "Should not trigger for non-pom.xml files");
  });

  test("Should reorder elements in pom.xml", async () => {
  const xml = `
    <project>
      <version>1.0.0</version>
      <groupId>com.example</groupId>
      <artifactId>demo</artifactId>
    </project>
  `;

  // Fake VS Code document
  const fakeDocument: any = {
    fileName: "pom.xml",
    getText: () => xml,
    positionAt: (offset: number) => {
      // Convert offset to a dummy position (row,col not actually used)
      return new vscode.Position(0, offset);
    },
  };

  let edits: vscode.TextEdit[] = [];

  // Fake event
  const fakeEvent: any = {
    document: fakeDocument,
    waitUntil: (promise: Promise<any>) =>
      promise.then((result: vscode.TextEdit[]) => {
        edits = result;
      }),
  };

  // Call listener directly
  await onWillSaveDocument(fakeEvent);

  // Check that edits were produced
  assert.ok(edits.length > 0, "Expected at least one edit to be applied");

  const newXml = edits[0].newText;

  // Parse the new XML with preserveOrder
  const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });
  const parsed = parser.parse(newXml);

  // Extract the <project> node
  const projectNode = parsed.find((node: any) => node.project)?.project;
  assert.ok(projectNode, "Project node should exist");

  // Get the ordered keys
  const keys = projectNode.map((child: any) => Object.keys(child)[0]);

  // Validate order according to ORDER (groupId, artifactId, version)
  assert.deepStrictEqual(keys, ["groupId", "artifactId", "version"]);
});

  test("Deactivate should not throw", () => {
    assert.doesNotThrow(() => deactivate());
  });
});
