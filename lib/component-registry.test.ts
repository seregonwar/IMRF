import { ComponentRegistry, CustomComponent, ComponentProps } from './component-registry';
import { createElement } from 'react';

// Mock React component for testing
const MockComponent = (props: any) => createElement('div', props, props.children);

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  describe('registerComponent', () => {
    it('should register a component successfully', () => {
      const component: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent
      };

      registry.registerComponent('TestComponent', component);
      expect(registry.hasComponent('TestComponent')).toBe(true);
      expect(registry.getRegisteredComponents()).toContain('TestComponent');
    });

    it('should throw error for invalid component name', () => {
      const component: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent
      };

      expect(() => registry.registerComponent('', component)).toThrow('Component name must be a non-empty string');
      expect(() => registry.registerComponent(null as any, component)).toThrow('Component name must be a non-empty string');
    });

    it('should throw error for missing component', () => {
      const component = {
        name: 'TestComponent'
      } as CustomComponent;

      expect(() => registry.registerComponent('TestComponent', component)).toThrow('Component must have a valid React component');
    });

    it('should allow overriding existing components', () => {
      const component1: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent
      };

      const component2: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent
      };

      registry.registerComponent('TestComponent', component1);
      registry.registerComponent('TestComponent', component2);
      
      expect(registry.getRegisteredComponents()).toHaveLength(1);
    });
  });

  describe('resolveComponent', () => {
    beforeEach(() => {
      const component: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent,
        propTypes: {
          title: {
            type: 'string',
            required: true
          },
          count: {
            type: 'number',
            defaultValue: 0
          }
        }
      };
      registry.registerComponent('TestComponent', component);
    });

    it('should resolve component with valid props', () => {
      const props = { title: 'Test Title', count: 5 };
      const result = registry.resolveComponent('TestComponent', props);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.props.title).toBe('Test Title');
      expect(result.props.count).toBe(5);
      expect(result.element).toBeDefined();
    });

    it('should apply default values', () => {
      const props = { title: 'Test Title' };
      const result = registry.resolveComponent('TestComponent', props);

      expect(result.isValid).toBe(true);
      expect(result.props.count).toBe(0); // Default value applied
    });

    it('should return error for unregistered component', () => {
      const result = registry.resolveComponent('UnknownComponent', {});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Component "UnknownComponent" is not registered');
    });

    it('should return error for missing required props', () => {
      const props = { count: 5 }; // Missing required 'title'
      const result = registry.resolveComponent('TestComponent', props);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Required prop "title" is missing for component "TestComponent"');
    });

    it('should return error for invalid prop types', () => {
      const props = { title: 123, count: 'invalid' }; // Wrong types
      const result = registry.resolveComponent('TestComponent', props);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prop "title" has invalid type for component "TestComponent". Expected string, got number');
      expect(result.errors).toContain('Prop "count" has invalid type for component "TestComponent". Expected number, got string');
    });
  });

  describe('validateComponent', () => {
    beforeEach(() => {
      const component: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent,
        validate: (props: ComponentProps) => props.title !== 'invalid'
      };
      registry.registerComponent('TestComponent', component);
    });

    it('should validate component definition successfully', () => {
      const definition = {
        name: 'TestComponent',
        props: { title: 'Valid Title' }
      };

      const result = registry.validateComponent(definition);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for unregistered component', () => {
      const definition = {
        name: 'UnknownComponent',
        props: {}
      };

      const result = registry.validateComponent(definition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Component "UnknownComponent" is not registered');
    });

    it('should use custom validator', () => {
      const definition = {
        name: 'TestComponent',
        props: { title: 'invalid' }
      };

      const result = registry.validateComponent(definition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom validation failed for component "TestComponent"');
    });
  });

  describe('component management', () => {
    it('should unregister components', () => {
      const component: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent
      };

      registry.registerComponent('TestComponent', component);
      expect(registry.hasComponent('TestComponent')).toBe(true);

      const removed = registry.unregisterComponent('TestComponent');
      expect(removed).toBe(true);
      expect(registry.hasComponent('TestComponent')).toBe(false);
    });

    it('should return false when unregistering non-existent component', () => {
      const removed = registry.unregisterComponent('NonExistent');
      expect(removed).toBe(false);
    });

    it('should clear all components', () => {
      const component1: CustomComponent = {
        name: 'Component1',
        component: MockComponent
      };
      const component2: CustomComponent = {
        name: 'Component2',
        component: MockComponent
      };

      registry.registerComponent('Component1', component1);
      registry.registerComponent('Component2', component2);
      expect(registry.getRegisteredComponents()).toHaveLength(2);

      registry.clear();
      expect(registry.getRegisteredComponents()).toHaveLength(0);
    });
  });

  describe('prop type validation', () => {
    beforeEach(() => {
      const component: CustomComponent = {
        name: 'TestComponent',
        component: MockComponent,
        propTypes: {
          stringProp: { type: 'string', required: true },
          numberProp: { type: 'number' },
          booleanProp: { type: 'boolean' },
          arrayProp: { type: 'array' },
          objectProp: { type: 'object' },
          customProp: {
            type: 'string',
            validator: (value: string) => value.length > 3
          }
        }
      };
      registry.registerComponent('TestComponent', component);
    });

    it('should validate string props', () => {
      const result = registry.resolveComponent('TestComponent', { 
        stringProp: 'valid string' 
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate number props', () => {
      const result = registry.resolveComponent('TestComponent', { 
        stringProp: 'test',
        numberProp: 42 
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate boolean props', () => {
      const result = registry.resolveComponent('TestComponent', { 
        stringProp: 'test',
        booleanProp: true 
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate array props', () => {
      const result = registry.resolveComponent('TestComponent', { 
        stringProp: 'test',
        arrayProp: [1, 2, 3] 
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate object props', () => {
      const result = registry.resolveComponent('TestComponent', { 
        stringProp: 'test',
        objectProp: { key: 'value' } 
      });
      expect(result.isValid).toBe(true);
    });

    it('should use custom validators', () => {
      const validResult = registry.resolveComponent('TestComponent', { 
        stringProp: 'test',
        customProp: 'long enough' 
      });
      expect(validResult.isValid).toBe(true);

      const invalidResult = registry.resolveComponent('TestComponent', { 
        stringProp: 'test',
        customProp: 'no' 
      });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Prop "customProp" failed custom validation for component "TestComponent"');
    });
  });
});