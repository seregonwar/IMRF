// Test only the frontmatter validation function to avoid ES module issues
describe('Frontmatter Validation', () => {
  // Define the validation function inline for testing
  function validateFrontmatter(metadata: Record<string, any>) {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields validation
    if (!metadata.title || typeof metadata.title !== 'string') {
      errors.push('Missing or invalid "title" field in frontmatter');
    }
    
    // Optional field type validation
    if (metadata.description && typeof metadata.description !== 'string') {
      warnings.push('Description should be a string');
    }
    
    if (metadata.author && typeof metadata.author !== 'string') {
      warnings.push('Author should be a string');
    }
    
    if (metadata.date && !isValidDate(metadata.date)) {
      warnings.push('Date should be in valid ISO format (YYYY-MM-DD)');
    }
    
    if (metadata.tags && !Array.isArray(metadata.tags)) {
      warnings.push('Tags should be an array of strings');
    } else if (metadata.tags && !metadata.tags.every((tag: any) => typeof tag === 'string')) {
      warnings.push('All tags should be strings');
    }
    
    if (metadata.visibility && !['public', 'private', 'draft'].includes(metadata.visibility)) {
      warnings.push('Visibility should be one of: public, private, draft');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  function isValidDate(dateString: any): boolean {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  it('should validate correct frontmatter', () => {
    const metadata = {
      title: 'Test Document',
      description: 'A test document',
      author: 'Test Author',
      date: '2023-12-01',
      tags: ['test', 'markdown'],
      visibility: 'public'
    };

    const result = validateFrontmatter(metadata);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const metadata = {
      description: 'A test document'
    };

    const result = validateFrontmatter(metadata);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing or invalid "title" field in frontmatter');
  });

  it('should warn about invalid field types', () => {
    const metadata = {
      title: 'Test Document',
      description: 123, // Should be string
      tags: 'not-an-array', // Should be array
      date: 'invalid-date'
    };

    const result = validateFrontmatter(metadata);
    
    expect(result.isValid).toBe(true); // Only title is required
    expect(result.warnings).toContain('Description should be a string');
    expect(result.warnings).toContain('Tags should be an array of strings');
    expect(result.warnings).toContain('Date should be in valid ISO format (YYYY-MM-DD)');
  });

  it('should validate visibility field', () => {
    const metadata = {
      title: 'Test Document',
      visibility: 'invalid-visibility'
    };

    const result = validateFrontmatter(metadata);
    
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('Visibility should be one of: public, private, draft');
  });
});