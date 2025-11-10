/**
 * Core logic for ordering pom.xml elements
 */
export class PomOrderer {
  // Desired order of pom.xml elements
  private static readonly ORDER = [
    "modelVersion", "parent", "groupId", "artifactId", "version", "packaging",
    "name", "description", "url", "inceptionYear", "organization", "licenses",
    "developers", "contributors", "mailingLists", "prerequisites", "modules",
    "scm", "issueManagement", "ciManagement", "distributionManagement", "properties",
    "dependencyManagement", "dependencies", "repositories", "pluginRepositories",
    "build", "reporting", "profiles",
  ];

  /**
   * Reorder <project> children while preserving whitespace
   */
  public order(xmlText: string): string {
    // Match the <project>...</project> block
    const projectMatch = xmlText.match(/<project\b[^>]*>([\s\S]*?)<\/project>/);
    if (!projectMatch) {
      return xmlText;
    }

    const projectContent = projectMatch[1];

    // Match all top-level elements inside <project> (including whitespace)
    const children = this.extractChildren(projectContent);

    // Separate into ordered and unordered children
    const orderedChildren = this.getOrderedChildren(children);
    const unorderedChildren = this.getUnorderedChildren(children);

    const newProjectContent = orderedChildren.concat(unorderedChildren).join("");

    // Replace old project content
    return xmlText.replace(projectMatch[1], newProjectContent);
  }

  /**
   * Check if the XML text has changed after reordering
   */
  public hasChanges(xmlText: string): boolean {
    return this.order(xmlText) !== xmlText;
  }

  /**
   * Extract all top-level child elements from project content
   */
  private extractChildren(projectContent: string): Array<{ name: string; text: string }> {
    const childRegex = /(\s*<(\w+)[^>]*>[\s\S]*?<\/\2>)/g;
    const children: Array<{ name: string; text: string }> = [];
    let match;

    while ((match = childRegex.exec(projectContent)) !== null) {
      const text = match[1];
      const name = match[2];
      children.push({ name, text });
    }

    return children;
  }

  /**
   * Get children that match the defined order
   */
  private getOrderedChildren(children: Array<{ name: string; text: string }>): string[] {
    const orderedChildren: string[] = [];

    for (const key of PomOrderer.ORDER) {
      for (const child of children) {
        if (child.name === key) {
          orderedChildren.push(child.text);
        }
      }
    }

    return orderedChildren;
  }

  /**
   * Get children that don't match the defined order
   */
  private getUnorderedChildren(children: Array<{ name: string; text: string }>): string[] {
    const unorderedChildren: string[] = [];

    for (const child of children) {
      if (!PomOrderer.ORDER.includes(child.name)) {
        unorderedChildren.push(child.text);
      }
    }

    return unorderedChildren;
  }
}
