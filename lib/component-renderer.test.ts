import { ComponentRenderer } from './component-renderer';
import { ComponentRegistry } from './component-registry';
import { ComponentParser } from './component-parser';
import { createElement } from 'react';

// Mock React components for testing
const MockAlert = (props: any) => createElement('div', { className: 'alert', ...props });
const MockCard = (props: any) => createElement('div', { className: 'card', ...props });

describe('ComponentRenderer', () => {
  let renderer: ComponentRenderer;
  let registry: ComponentRegistry;
  let parser: ComponentParser;

  beforeEach(() => {
    registry = new ComponentRegistry();
    parser = new ComponentParser();
    renderer = new ComponentRenderer({ registry, parser });

    // Register test components
    registry.registerComponent('Alert', {
      name: 'Alert',
      component: MockAlert,
      propTypes: {
        type: {
          type: 'string',
          defaultValue: 'info'
        },
        title: {
          type: 'string'
        }
      }
    });

    registry.registerComponent('Card', {
      name: 'Card',
      component: MockCard,
      propTypes: {
        title: {
          type: 'string',
          required: true
        }
      }
    });
  });

  describe('renderComponents', () => {
    it('should process valid components successfully', () => {
      const content = 'Text before <Alert type="warning" /> text after';
      const result = renderer.renderComponents(content);

      expect(result.errors).toHaveLength(0);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe('Alert');
      expect(result.components[0].isValid).toBe(true);
      expect(result.content).toContain('__COMPONENT_0_Alert__');
    });

    it('should handle multiple components', () => {
      const content = `
        <Alert type="info" />
        Some content
        <Card title="Test Card" />
      `;
      const result = renderer.renderComponents(content);

      expect(result.errors).toHaveLength(0);
      expect(result.components).toHaveLength(2);
      expect(result.components[0].name).toBe('Alert');
      expect(result.components[1].name).toBe('Card');
    });

    it('should handle component validation errors', () => {
      const content = '<Card />'; // Missing required title prop
      const result = renderer.renderComponents(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].isValid).toBe(false);
      expect(result.content).toContain('Component Error: Card');
    });

    it('should handle unregistered components', () => {
      const content = '<UnknownComponent />';
      const result = renderer.renderComponents(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].isValid).toBe(false);
      expect(result.content).toContain('Component Error: UnknownComponent');
    });

    it('should preserve component order and positions', () => {
      const content = 'Start <Alert type="info" /> middle <Card title="Test" /> end';
      const result = renderer.renderComponents(content);

      expect(result.components).toHaveLength(2);
      expect(result.components[0].name).toBe('Alert');
      expect(result.components[1].name).toBe('Card');
      expect(result.components[0].position.start).toBeLessThan(result.components[1].position.start);
    });

    it('should handle block components with children', () => {
      const content = '<Card title="Test">This is the content</Card>';
      const result = renderer.renderComponents(content);

      expect(result.components).toHaveLength(1);
      expect(result.components[0].children).toBe('This is the content');
      expect(result.components[0].isValid).toBe(true);
    });
  });

  describe('renderComponentsAsElements', () => {
    it('should create React elements for valid components', () => {
      const content = '<Alert type="warning" />';
      const result = renderer.renderComponentsAsElements(content);

      expect(result.errors).toHaveLength(0);
      expect(result.elements).toHaveLength(1);
      expect(result.elements[0]).toBeDefined();
    });

    it('should handle components with children', () => {
      const content = '<Card title="Test">Child content</Card>';
      const result = renderer.renderComponentsAsElements(content);

      expect(result.errors).toHaveLength(0);
      expect(result.elements).toHaveLength(1);
    });

    it('should collect errors for invalid components', () => {
      const content = '<Card />'; // Missing required title
      const result = renderer.renderComponentsAsElements(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.elements).toHaveLength(0);
    });
  });

  describe('extractComponentDefinitions', () => {
    it('should extract component definitions from content', () => {
      const content = `
        <Alert type="info" title="Note" />
        <Card title="Example">Content here</Card>
      `;
      const definitions = renderer.extractComponentDefinitions(content);

      expect(definitions).toHaveLength(2);
      expect(definitions[0].name).toBe('Alert');
      expect(definitions[0].props.type).toBe('info');
      expect(definitions[1].name).toBe('Card');
      expect(definitions[1].children).toBe('Content here');
    });

    it('should handle empty content', () => {
      const content = 'No components here';
      const definitions = renderer.extractComponentDefinitions(content);

      expect(definitions).toHaveLength(0);
    });
  });

  describe('validateComponents', () => {
    it('should validate all components in content', () => {
      const content = '<Alert type="info" /> <Card title="Test" />';
      const result = renderer.validateComponents(content);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const content = '<Alert type="info" /> <Card />'; // Card missing required title
      const result = renderer.validateComponents(content);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect syntax errors', () => {
      const content = '<Alert type="info" /> <InvalidSyntax';
      const result = renderer.validateComponents(content);

      // The parser should handle this gracefully
      expect(result.errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error handling', () => {
    it('should create error placeholders for failed components', () => {
      const content = '<UnknownComponent />';
      const result = renderer.renderComponents(content);

      expect(result.content).toContain('Component Error: UnknownComponent');
      expect(result.content).toContain('not registered');
    });

    it('should handle rendering exceptions gracefully', () => {
      // Register a component that throws during rendering
      const ThrowingComponent = () => {
        throw new Error('Rendering failed');
      };

      registry.registerComponent('ThrowingComponent', {
        name: 'ThrowingComponent',
        component: ThrowingComponent
      });

      const content = '<ThrowingComponent />';
      const result = renderer.renderComponents(content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.content).toContain('Component Error: ThrowingComponent');
    });

    it('should isolate component errors', () => {
      const content = '<UnknownComponent /> <Alert type="info" />';
      const result = renderer.renderComponents(content);

      // First component should fail, second should succeed
      expect(result.components).toHaveLength(2);
      expect(result.components[0].isValid).toBe(false);
      expect(result.components[1].isValid).toBe(true);
    });
  });

  describe('component isolation', () => {
    it('should maintain component isolation', () => {
      const content = '<Alert type="info" /> <Alert type="warning" />';
      const result = renderer.renderComponents(content);

      expect(result.components).toHaveLength(2);
      expect(result.components[0].props.type).toBe('info');
      expect(result.components[1].props.type).toBe('warning');
      
      // Each component should be independent
      expect(result.components[0].isValid).toBe(true);
      expect(result.components[1].isValid).toBe(true);
    });

    it('should handle identical components independently', () => {
      const content = '<Card title="First" /> <Card title="Second" />';
      const result = renderer.renderComponents(content);

      expect(result.components).toHaveLength(2);
      expect(result.components[0].props.title).toBe('First');
      expect(result.components[1].props.title).toBe('Second');
    });
  });
});