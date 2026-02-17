import { ComponentProps, ComponentDefinition, ComponentSyntaxMatch } from './component-registry';

/**
 * Parses custom component syntax from Markdown content
 * Supports both self-closing and block syntax:
 * - Self-closing: <ComponentName prop="value" />
 * - Block: <ComponentName prop="value">content</ComponentName>
 */
export class ComponentParser {
  
  /**
   * Parse all component syntax matches from content
   */
  parseComponents(content: string): ComponentSyntaxMatch[] {
    const matches: ComponentSyntaxMatch[] = [];
    
    // Regex for self-closing components: <ComponentName prop="value" />
    const selfClosingRegex = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*\/>/g;
    
    // Regex for block components: <ComponentName prop="value">content</ComponentName>
    const blockRegex = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)>(.*?)<\/\1>/gs;
    
    // Find self-closing components
    let match;
    while ((match = selfClosingRegex.exec(content)) !== null) {
      const [fullMatch, name, propsString] = match;
      const props = this.parseProps(propsString);
      
      matches.push({
        fullMatch,
        name,
        props,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length
      });
    }
    
    // Reset regex lastIndex
    blockRegex.lastIndex = 0;
    
    // Find block components
    while ((match = blockRegex.exec(content)) !== null) {
      const [fullMatch, name, propsString, children] = match;
      const props = this.parseProps(propsString);
      
      matches.push({
        fullMatch,
        name,
        props,
        children: children.trim(),
        startIndex: match.index,
        endIndex: match.index + fullMatch.length
      });
    }
    
    // Sort by start index to maintain order
    return matches.sort((a, b) => a.startIndex - b.startIndex);
  }
  
  /**
   * Parse a single component definition from syntax
   */
  parseComponentDefinition(syntax: string): ComponentDefinition | null {
    const matches = this.parseComponents(syntax);
    return matches.length > 0 ? {
      name: matches[0].name,
      props: matches[0].props,
      children: matches[0].children
    } : null;
  }
  
  /**
   * Parse props string into ComponentProps object
   */
  private parseProps(propsString: string): ComponentProps {
    const props: ComponentProps = {};
    
    if (!propsString.trim()) {
      return props;
    }

    const len = propsString.length;
    let i = 0;

    while (i < len) {
      while (i < len && /\s/.test(propsString[i])) i += 1;
      if (i >= len) break;

      const nameStart = i;
      while (i < len && /[A-Za-z0-9_]/.test(propsString[i])) i += 1;
      if (i === nameStart) {
        i += 1;
        continue;
      }

      const propName = propsString.slice(nameStart, i);

      while (i < len && /\s/.test(propsString[i])) i += 1;

      if (i < len && propsString[i] === '=') {
        i += 1;
        while (i < len && /\s/.test(propsString[i])) i += 1;

        if (i >= len) {
          props[propName] = true;
          break;
        }

        const nextChar = propsString[i];
        if (nextChar === '"') {
          const parsed = this.readQuotedString(propsString, i);
          props[propName] = parsed.value;
          i = parsed.nextIndex;
          continue;
        }

        if (nextChar === '{') {
          const parsed = this.readBalancedBraces(propsString, i);
          props[propName] = this.parseJSValue(parsed.value);
          i = parsed.nextIndex;
          continue;
        }

        const parsed = this.readBareToken(propsString, i);
        props[propName] = parsed.value;
        i = parsed.nextIndex;
        continue;
      }

      props[propName] = true;
    }

    return props;
  }

  private readQuotedString(input: string, startIndex: number): { value: string; nextIndex: number } {
    const len = input.length;
    if (startIndex >= len || input[startIndex] !== '"') {
      return { value: '', nextIndex: startIndex };
    }

    let i = startIndex + 1;
    let value = '';
    let escaped = false;

    while (i < len) {
      const ch = input[i];
      if (escaped) {
        value += ch;
        escaped = false;
        i += 1;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        i += 1;
        continue;
      }
      if (ch === '"') {
        return { value, nextIndex: i + 1 };
      }
      value += ch;
      i += 1;
    }

    return { value, nextIndex: len };
  }

  private readBareToken(input: string, startIndex: number): { value: string; nextIndex: number } {
    const len = input.length;
    let i = startIndex;
    while (i < len && !/\s/.test(input[i])) i += 1;
    return { value: input.slice(startIndex, i), nextIndex: i };
  }

  private readBalancedBraces(input: string, startIndex: number): { value: string; nextIndex: number } {
    const len = input.length;
    if (startIndex >= len || input[startIndex] !== '{') {
      return { value: '', nextIndex: startIndex };
    }

    let depth = 0;
    let inString: '"' | "'" | null = null;
    let escaped = false;

    for (let i = startIndex; i < len; i += 1) {
      const ch = input[i];

      if (inString !== null) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === inString) {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }

      if (ch === '{') {
        depth += 1;
        continue;
      }

      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          return { value: input.slice(startIndex + 1, i), nextIndex: i + 1 };
        }
      }
    }

    return { value: input.slice(startIndex + 1), nextIndex: len };
  }
  
  /**
   * Parse JavaScript-like values from {value} syntax
   */
  private parseJSValue(value: string): any {
    const trimmed = value.trim();
    
    // Boolean values
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    
    // Null and undefined
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    
    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return parseFloat(trimmed);
    }
    
    // Arrays (simple parsing)
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed; // Fallback to string if JSON parsing fails
      }
    }
    
    // Objects (simple parsing) - handle both single and double quotes
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        // Try parsing as-is first
        return JSON.parse(trimmed);
      } catch {
        try {
          // Try converting single quotes to double quotes for JSON compatibility
          const jsonString = trimmed.replace(/'/g, '"');
          return JSON.parse(jsonString);
        } catch {
          return trimmed; // Fallback to string if JSON parsing fails
        }
      }
    }
    
    // String (remove quotes if present)
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    
    // Default to string
    return trimmed;
  }
  
  /**
   * Replace component syntax in content with rendered components
   */
  replaceComponents(content: string, replacer: (match: ComponentSyntaxMatch) => string): string {
    const matches = this.parseComponents(content);
    
    // Replace from end to start to maintain correct indices
    let result = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const replacement = replacer(match);
      result = result.slice(0, match.startIndex) + replacement + result.slice(match.endIndex);
    }
    
    return result;
  }
  
  /**
   * Validate component syntax
   */
  validateSyntax(content: string): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const matches = this.parseComponents(content);
      
      // Check for malformed components
      const componentRegex = /<[A-Z][a-zA-Z0-9]*[^>]*>/g;
      const allMatches = content.match(componentRegex) || [];
      
      if (allMatches.length > matches.length) {
        warnings.push('Some component syntax may be malformed and was not parsed');
      }
      
      // Validate each parsed component
      matches.forEach((match, index) => {
        if (!match.name) {
          errors.push(`Component at position ${match.startIndex} has no name`);
        }
        
        if (match.name && !/^[A-Z][a-zA-Z0-9]*$/.test(match.name)) {
          errors.push(`Component name "${match.name}" must start with uppercase letter and contain only alphanumeric characters`);
        }
      });
      
    } catch (error) {
      errors.push(`Syntax parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Global parser instance
export const globalComponentParser = new ComponentParser();
