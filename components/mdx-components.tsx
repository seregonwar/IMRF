import { Alert } from './ui/alert';
import { Card } from './ui/card';
import { CodeBlock } from './custom/CodeBlock';
import { Callout } from './custom/Callout';
import { globalComponentRegistry } from '../lib/component-registry';

// Register built-in components
globalComponentRegistry.registerComponent('Alert', {
  name: 'Alert',
  component: Alert,
  propTypes: {
    variant: {
      type: 'string',
      defaultValue: 'default'
    },
    title: {
      type: 'string'
    }
  }
});

globalComponentRegistry.registerComponent('Card', {
  name: 'Card',
  component: Card,
  propTypes: {
    title: {
      type: 'string'
    },
    className: {
      type: 'string'
    }
  }
});

globalComponentRegistry.registerComponent('CodeBlock', {
  name: 'CodeBlock',
  component: CodeBlock,
  propTypes: {
    language: {
      type: 'string',
      defaultValue: 'text'
    },
    title: {
      type: 'string'
    },
    showLineNumbers: {
      type: 'boolean',
      defaultValue: false
    },
    className: {
      type: 'string',
      defaultValue: ''
    }
  }
});

globalComponentRegistry.registerComponent('Callout', {
  name: 'Callout',
  component: Callout,
  propTypes: {
    type: {
      type: 'string',
      defaultValue: 'info',
      validator: (value: string) => ['info', 'warning', 'error', 'success'].includes(value)
    },
    title: {
      type: 'string'
    },
    icon: {
      type: 'boolean',
      defaultValue: true
    },
    className: {
      type: 'string',
      defaultValue: ''
    }
  }
});

// Create dynamic components object that includes registered components
function createMDXComponents() {
  const registeredComponents: Record<string, any> = {};
  
  // Add all registered components
  globalComponentRegistry.getRegisteredComponents().forEach(name => {
    registeredComponents[name] = (props: any) => {
      const rendered = globalComponentRegistry.resolveComponent(name, props);
      if (rendered.isValid && rendered.element) {
        return rendered.element;
      }
      
      // Return error display for invalid components
      return (
        <div className="border border-red-300 bg-red-50 p-4 rounded-md">
          <h4 className="text-red-800 font-semibold">Component Error: {name}</h4>
          <ul className="text-red-700 text-sm mt-2">
            {rendered.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      );
    };
  });
  
  return {
    ...registeredComponents,
    // HTML overrides can go here, e.g. Pre, Code, etc.
  };
}

export const components = createMDXComponents();
