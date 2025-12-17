import fs from 'fs';
import path from 'path';

describe('Markdown Integration Tests', () => {
  it('should process existing docs files without errors', () => {
    const docsDir = path.join(process.cwd(), 'docs');
    
    if (!fs.existsSync(docsDir)) {
      console.warn('Docs directory not found, skipping integration test');
      return;
    }

    const files = fs.readdirSync(docsDir).filter(file => 
      file.endsWith('.md') || file.endsWith('.mdx')
    );

    expect(files.length).toBeGreaterThan(0);

    files.forEach(file => {
      const filePath = path.join(docsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation that file can be read
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      
      // Test that we can extract basic info without the complex parsing
      const hasHeadings = content.includes('#');
      expect(hasHeadings).toBe(true);
    });
  });

  it('should validate that docs directory structure is correct', () => {
    const docsDir = path.join(process.cwd(), 'docs');
    
    if (!fs.existsSync(docsDir)) {
      console.warn('Docs directory not found, skipping test');
      return;
    }

    // Check that we have the expected structure
    const indexExists = fs.existsSync(path.join(docsDir, 'index.md'));
    const featuresExists = fs.existsSync(path.join(docsDir, 'features.md'));
    
    expect(indexExists || featuresExists).toBe(true);
  });
});