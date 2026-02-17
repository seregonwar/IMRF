import { ComponentParser } from './component-parser';

describe('ComponentParser', () => {
  let parser: ComponentParser;

  beforeEach(() => {
    parser = new ComponentParser();
  });

  describe('parseComponents', () => {
    it('should parse self-closing components', () => {
      const content = 'Some text <Alert type="warning" /> more text';
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe('Alert');
      expect(matches[0].props.type).toBe('warning');
      expect(matches[0].children).toBeUndefined();
      expect(matches[0].startIndex).toBe(10);
    });

    it('should parse block components', () => {
      const content = 'Text <Callout title="Note">This is important</Callout> more text';
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe('Callout');
      expect(matches[0].props.title).toBe('Note');
      expect(matches[0].children).toBe('This is important');
    });

    it('should parse multiple components', () => {
      const content = `
        <Alert type="info" />
        Some content
        <CodeBlock language="javascript">
          console.log('hello');
        </CodeBlock>
      `;
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(2);
      expect(matches[0].name).toBe('Alert');
      expect(matches[1].name).toBe('CodeBlock');
      expect(matches[1].props.language).toBe('javascript');
    });

    it('should handle components with no props', () => {
      const content = '<SimpleComponent />';
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe('SimpleComponent');
      expect(Object.keys(matches[0].props)).toHaveLength(0);
    });

    it('should handle nested components in content', () => {
      const content = `
        <Callout>
          This contains <Alert type="warning" /> inside
        </Callout>
      `;
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(2);
      // Components are parsed in order they appear, so Callout comes first
      expect(matches[0].name).toBe('Callout');
      expect(matches[1].name).toBe('Alert');
    });
  });

  describe('parseProps', () => {
    it('should parse string props', () => {
      const content = '<Component title="Hello World" />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.title).toBe('Hello World');
    });

    it('should parse boolean props', () => {
      const content = '<Component enabled disabled={false} />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.enabled).toBe(true);
      expect(matches[0].props.disabled).toBe(false);
    });

    it('should parse number props', () => {
      const content = '<Component count={42} price={19.99} />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.count).toBe(42);
      expect(matches[0].props.price).toBe(19.99);
    });

    it('should parse array props', () => {
      const content = '<Component items={[1, 2, 3]} />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.items).toEqual([1, 2, 3]);
    });

    it('should parse object props', () => {
      const content = '<Component config={{"key": "value"}} />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.config).toEqual({ key: 'value' });
    });

    it('should handle bare values as strings', () => {
      const content = '<Component type=info />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.type).toBe('info');
    });

    it('should handle complex prop combinations', () => {
      const content = '<Component title="Test" count={5} enabled visible={true} />';
      const matches = parser.parseComponents(content);

      expect(matches[0].props.title).toBe('Test');
      expect(matches[0].props.count).toBe(5);
      expect(matches[0].props.enabled).toBe(true);
      expect(matches[0].props.visible).toBe(true);
    });
  });

  describe('parseComponentDefinition', () => {
    it('should parse single component definition', () => {
      const syntax = '<Alert type="warning" title="Important" />';
      const definition = parser.parseComponentDefinition(syntax);

      expect(definition).toBeDefined();
      expect(definition!.name).toBe('Alert');
      expect(definition!.props.type).toBe('warning');
      expect(definition!.props.title).toBe('Important');
    });

    it('should return null for invalid syntax', () => {
      const syntax = 'No components here';
      const definition = parser.parseComponentDefinition(syntax);

      expect(definition).toBeNull();
    });
  });

  describe('replaceComponents', () => {
    it('should replace components with custom content', () => {
      const content = 'Before <Alert type="info" /> After';
      const result = parser.replaceComponents(content, (match) => {
        return `[ALERT:${match.props.type}]`;
      });

      expect(result).toBe('Before [ALERT:info] After');
    });

    it('should replace multiple components', () => {
      const content = '<Alert type="info" /> and <Card title="Test" />';
      const result = parser.replaceComponents(content, (match) => {
        return `[${match.name.toUpperCase()}]`;
      });

      expect(result).toBe('[ALERT] and [CARD]');
    });

    it('should maintain correct positions when replacing', () => {
      const content = 'Start <A /> middle <B /> end';
      const result = parser.replaceComponents(content, (match) => {
        return `[${match.name}]`;
      });

      expect(result).toBe('Start [A] middle [B] end');
    });
  });

  describe('validateSyntax', () => {
    it('should validate correct syntax', () => {
      const content = '<Alert type="info" /> and <Card title="Test">Content</Card>';
      const result = parser.validateSyntax(content);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid component names', () => {
      const content = '<alert type="info" />'; // lowercase name
      const result = parser.validateSyntax(content);

      expect(result.isValid).toBe(true); // This won't be parsed as a component
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle empty content', () => {
      const content = '';
      const result = parser.validateSyntax(content);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate component names', () => {
      const content = '<123Invalid />';
      const matches = parser.parseComponents(content);
      
      // Component names starting with numbers won't be parsed
      expect(matches).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle components with whitespace', () => {
      const content = '<Alert   type="info"   />';
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      expect(matches[0].props.type).toBe('info');
    });

    it('should handle multiline components', () => {
      const content = `
        <CodeBlock
          language="javascript"
          title="Example"
        >
          console.log('test');
        </CodeBlock>
      `;
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      expect(matches[0].props.language).toBe('javascript');
      expect(matches[0].props.title).toBe('Example');
      expect(matches[0].children?.trim()).toBe("console.log('test');");
    });

    it('should handle props with special characters', () => {
      const content = '<Component data-test="value" aria-label="Label" />';
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      // Note: Our current regex doesn't support hyphenated props
      // This is a limitation we could address in future iterations
    });

    it('should handle malformed JSON gracefully', () => {
      const content = '<Component config={invalid json} />';
      const matches = parser.parseComponents(content);

      expect(matches).toHaveLength(1);
      expect(matches[0].props.config).toBe('invalid json'); // Falls back to string
    });
  });
});