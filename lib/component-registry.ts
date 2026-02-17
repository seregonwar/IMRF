import { ReactElement, ComponentType } from 'react';
import { ValidationResult } from './markdown';

export type ComponentProps = Record<string, any>;

export interface CustomComponent {
  name: string;
  component: ComponentType<any>;
  validate?: (props: ComponentProps) => boolean;
  propTypes?: Record<string, PropTypeValidator>;
}

export interface ComponentDefinition {
  name: string;
  props: ComponentProps;
  children?: string;
}

export interface RenderedComponent {
  element: ReactElement;
  props: ComponentProps;
  isValid: boolean;
  errors: string[];
}

export interface PropTypeValidator {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  validator?: (value: any) => boolean;
  defaultValue?: any;
}

export interface ComponentSyntaxMatch {
  fullMatch: string;
  name: string;
  props: ComponentProps;
  children?: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Registry for managing custom Markdown components
 */
export class ComponentRegistry {
  private components = new Map<string, CustomComponent>();
  
  /**
   * Register a custom component
   */
  registerComponent(name: string, component: CustomComponent): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Component name must be a non-empty string');
    }
    
    if (!component.component) {
      throw new Error('Component must have a valid React component');
    }
    
    this.components.set(name, {
      ...component,
      name
    });
  }
  
  /**
   * Resolve and render a component with given props
   */
  resolveComponent(name: string, props: ComponentProps = {}): RenderedComponent {
    const component = this.components.get(name);
    
    if (!component) {
      return {
        element: null as any,
        props,
        isValid: false,
        errors: [`Component "${name}" is not registered`]
      };
    }
    
    // Validate props
    const validation = this.validateComponentProps(component, props);
    
    if (!validation.isValid) {
      return {
        element: null as any,
        props,
        isValid: false,
        errors: validation.errors
      };
    }
    
    // Apply default values and create processed props
    const processedProps = this.processProps(component, props);
    
    try {
      const element = component.component(processedProps);
      
      return {
        element,
        props: processedProps,
        isValid: true,
        errors: []
      };
    } catch (error) {
      return {
        element: null as any,
        props: processedProps,
        isValid: false,
        errors: [`Error rendering component "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
  
  /**
   * Validate a component definition
   */
  validateComponent(definition: ComponentDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if component exists
    if (!this.components.has(definition.name)) {
      errors.push(`Component "${definition.name}" is not registered`);
      return { isValid: false, errors, warnings };
    }
    
    const component = this.components.get(definition.name)!;
    
    // Validate props
    const propValidation = this.validateComponentProps(component, definition.props);
    errors.push(...propValidation.errors);
    warnings.push(...propValidation.warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Get all registered component names
   */
  getRegisteredComponents(): string[] {
    return Array.from(this.components.keys());
  }
  
  /**
   * Check if a component is registered
   */
  hasComponent(name: string): boolean {
    return this.components.has(name);
  }
  
  /**
   * Unregister a component
   */
  unregisterComponent(name: string): boolean {
    return this.components.delete(name);
  }
  
  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }
  
  /**
   * Validate component props against prop types
   */
  private validateComponentProps(component: CustomComponent, props: ComponentProps): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Use custom validator if provided
    if (component.validate && !component.validate(props)) {
      errors.push(`Custom validation failed for component "${component.name}"`);
    }
    
    // Validate against prop types if defined
    if (component.propTypes) {
      for (const [propName, propType] of Object.entries(component.propTypes)) {
        const value = props[propName];
        
        // Check required props
        if (propType.required && (value === undefined || value === null)) {
          errors.push(`Required prop "${propName}" is missing for component "${component.name}"`);
          continue;
        }
        
        // Skip validation if prop is not provided and not required
        if (value === undefined || value === null) {
          continue;
        }
        
        // Type validation
        if (!this.validatePropType(value, propType)) {
          errors.push(`Prop "${propName}" has invalid type for component "${component.name}". Expected ${propType.type}, got ${typeof value}`);
        }
        
        // Custom validator
        if (propType.validator && !propType.validator(value)) {
          errors.push(`Prop "${propName}" failed custom validation for component "${component.name}"`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate a single prop against its type definition
   */
  private validatePropType(value: any, propType: PropTypeValidator): boolean {
    switch (propType.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }
  
  /**
   * Process props by applying default values
   */
  private processProps(component: CustomComponent, props: ComponentProps): ComponentProps {
    const processedProps = { ...props };
    
    if (component.propTypes) {
      for (const [propName, propType] of Object.entries(component.propTypes)) {
        if (processedProps[propName] === undefined && propType.defaultValue !== undefined) {
          processedProps[propName] = propType.defaultValue;
        }
      }
    }
    
    return processedProps;
  }
}

// Global registry instance
export const globalComponentRegistry = new ComponentRegistry();