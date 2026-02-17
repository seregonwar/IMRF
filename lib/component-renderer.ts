import { ReactElement, createElement, Fragment } from 'react';
import { ComponentRegistry, ComponentDefinition, ComponentSyntaxMatch, globalComponentRegistry } from './component-registry';
import { ComponentParser, globalComponentParser } from './component-parser';
import { ValidationResult } from './markdown';

export interface RenderOptions {
  registry?: ComponentRegistry;
  parser?: ComponentParser;
  isolateComponents?: boolean;
  errorBoundary?: boolean;
}

export interface ComponentRenderResult {
  content: string;
  components: RenderedComponentInfo[];
  errors: string[];
  warnings: string[];
}

export interface RenderedComponentInfo {
  name: string;
  props: Record<string, any>;
  children?: string;
  isValid: boolean;
  errors: string[];
  position: { start: number; end: number };
}

/**
 * Renders custom components within Markdown content
 */
export class ComponentRenderer {
  private registry: ComponentRegistry;
  private parser: ComponentParser;
  
  constructor(options: RenderOptions = {}) {
    this.registry = options.registry || globalComponentRegistry;
    this.parser = options.parser || globalComponentParser;
  }
  
  /**
   * Process and render components in markdown content
   */
  renderComponents(content: string, options: RenderOptions = {}): ComponentRenderResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const components: RenderedComponentInfo[] = [];
    
    // Parse component syntax
    const syntaxValidation = this.parser.validateSyntax(content);
    errors.push(...syntaxValidation.errors);
    warnings.push(...syntaxValidation.warnings);
    
    if (!syntaxValidation.isValid) {
      return {
        content,
        components,
        errors,
        warnings
      };
    }
    
    // Find all component matches
    const matches = this.parser.parseComponents(content);
    
    // Process each component
    let processedContent = content;
    const componentInfos: RenderedComponentInfo[] = [];
    
    // Process from end to start to maintain correct indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      
      // Validate component
      const definition: ComponentDefinition = {
        name: match.name,
        props: match.props,
        children: match.children
      };
      
      const validation = this.registry.validateComponent(definition);
      
      const componentInfo: RenderedComponentInfo = {
        name: match.name,
        props: match.props,
        children: match.children,
        isValid: validation.isValid,
        errors: validation.errors,
        position: { start: match.startIndex, end: match.endIndex }
      };
      
      componentInfos.unshift(componentInfo); // Add to beginning to maintain order
      
      if (!validation.isValid) {
        errors.push(...validation.errors);
        
        // Replace with error placeholder
        const errorPlaceholder = this.createErrorPlaceholder(match.name, validation.errors);
        processedContent = this.replaceAtPosition(
          processedContent,
          match.startIndex,
          match.endIndex,
          errorPlaceholder
        );
      } else {
        // Render component
        try {
          const rendered = this.registry.resolveComponent(match.name, match.props);
          
          if (rendered.isValid) {
            // For markdown processing, we'll replace with a placeholder that can be processed later
            const placeholder = this.createComponentPlaceholder(match, i);
            processedContent = this.replaceAtPosition(
              processedContent,
              match.startIndex,
              match.endIndex,
              placeholder
            );
          } else {
            errors.push(...rendered.errors);
            const errorPlaceholder = this.createErrorPlaceholder(match.name, rendered.errors);
            processedContent = this.replaceAtPosition(
              processedContent,
              match.startIndex,
              match.endIndex,
              errorPlaceholder
            );
          }
        } catch (error) {
          const errorMsg = `Failed to render component "${match.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          
          const errorPlaceholder = this.createErrorPlaceholder(match.name, [errorMsg]);
          processedContent = this.replaceAtPosition(
            processedContent,
            match.startIndex,
            match.endIndex,
            errorPlaceholder
          );
        }
      }
    }
    
    return {
      content: processedContent,
      components: componentInfos,
      errors,
      warnings
    };
  }
  
  /**
   * Create React elements for components (for direct React rendering)
   */
  renderComponentsAsElements(content: string): { elements: ReactElement[]; errors: string[] } {
    const errors: string[] = [];
    const elements: ReactElement[] = [];
    
    const matches = this.parser.parseComponents(content);
    
    matches.forEach((match, index) => {
      const definition: ComponentDefinition = {
        name: match.name,
        props: match.props,
        children: match.children
      };
      
      const validation = this.registry.validateComponent(definition);
      
      if (validation.isValid) {
        const rendered = this.registry.resolveComponent(match.name, match.props);
        
        if (rendered.isValid && rendered.element) {
          // Add children if present
          let element = rendered.element;
          if (match.children) {
            element = createElement(
              rendered.element.type,
              rendered.element.props,
              match.children
            );
          }
          
          elements.push(createElement(Fragment, { key: index }, element));
        } else {
          errors.push(...rendered.errors);
        }
      } else {
        errors.push(...validation.errors);
      }
    });
    
    return { elements, errors };
  }
  
  /**
   * Get component definitions from content
   */
  extractComponentDefinitions(content: string): ComponentDefinition[] {
    const matches = this.parser.parseComponents(content);
    
    return matches.map(match => ({
      name: match.name,
      props: match.props,
      children: match.children
    }));
  }
  
  /**
   * Validate all components in content
   */
  validateComponents(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate syntax
    const syntaxValidation = this.parser.validateSyntax(content);
    errors.push(...syntaxValidation.errors);
    warnings.push(...syntaxValidation.warnings);
    
    // Validate each component
    const definitions = this.extractComponentDefinitions(content);
    
    definitions.forEach(definition => {
      const validation = this.registry.validateComponent(definition);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Replace content at specific position
   */
  private replaceAtPosition(content: string, start: number, end: number, replacement: string): string {
    return content.slice(0, start) + replacement + content.slice(end);
  }
  
  /**
   * Create placeholder for component that will be processed later
   */
  private createComponentPlaceholder(match: ComponentSyntaxMatch, index: number): string {
    // Create a unique placeholder that can be replaced during MDX processing
    return `__COMPONENT_${index}_${match.name}__`;
  }
  
  /**
   * Create error placeholder for failed components
   */
  private createErrorPlaceholder(componentName: string, errors: string[]): string {
    const errorList = errors.map(error => `- ${error}`).join('\n');
    return `\n> **Component Error: ${componentName}**\n>\n${errorList.split('\n').map(line => `> ${line}`).join('\n')}\n`;
  }
}

// Global renderer instance
export const globalComponentRenderer = new ComponentRenderer();