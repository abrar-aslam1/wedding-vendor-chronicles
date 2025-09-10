import { describe, test, expect } from 'vitest';
import {
  slugToLabel,
  getCanonicalSlug,
  validateCategoryName,
  getSEOCategoryName,
  hasKnownMapping,
  getSimilarCategories,
  getCategoryMappings
} from '../taxonomy';

describe('Taxonomy Utilities', () => {
  describe('slugToLabel', () => {
    test('converts basic slugs to proper labels', () => {
      expect(slugToLabel('photographers')).toBe('Photographers');
      expect(slugToLabel('wedding-venues')).toBe('Wedding Venues');
      expect(slugToLabel('makeup-artists')).toBe('Makeup Artists');
    });

    test('handles DJs special case', () => {
      expect(slugToLabel('djs')).toBe('DJs');
      expect(slugToLabel('djs-and-bands')).toBe('DJs and Bands');
    });

    test('prevents duplication in category names', () => {
      expect(slugToLabel('djs-djs-and-bands')).toBe('DJs and Bands');
      expect(slugToLabel('djs djs and bands')).toBe('DJs and Bands');
      expect(slugToLabel('photographers-photographers')).toBe('Photographers');
    });

    test('handles empty or invalid input', () => {
      expect(slugToLabel('')).toBe('');
      expect(slugToLabel('   ')).toBe('');
    });

    test('handles unknown categories with title case', () => {
      expect(slugToLabel('custom-category')).toBe('Custom Category');
      expect(slugToLabel('new-wedding-service')).toBe('New Wedding Service');
    });

    test('preserves proper capitalization for articles and prepositions', () => {
      expect(slugToLabel('day-of-coordinators')).toBe('Day-of Coordinators');
      expect(slugToLabel('justices-of-peace')).toBe('Justices of Peace');
    });
  });

  describe('getCanonicalSlug', () => {
    test('creates proper slugs from various inputs', () => {
      expect(getCanonicalSlug('Wedding Photographers')).toBe('wedding-photographers');
      expect(getCanonicalSlug('DJs and Bands')).toBe('djs-and-bands');
      expect(getCanonicalSlug('Makeup Artists')).toBe('makeup-artists');
    });

    test('fixes duplication issues', () => {
      expect(getCanonicalSlug('djs djs and bands')).toBe('djs-and-bands');
      expect(getCanonicalSlug('DJs DJs and Bands')).toBe('djs-and-bands');
      expect(getCanonicalSlug('photographers photographers')).toBe('photographers');
    });

    test('handles special characters and spacing', () => {
      expect(getCanonicalSlug('Wedding & Event Planners')).toBe('wedding-event-planners');
      expect(getCanonicalSlug('Hair   Stylists')).toBe('hair-stylists');
      expect(getCanonicalSlug('  Cake Designers  ')).toBe('cake-designers');
    });

    test('removes leading and trailing hyphens', () => {
      expect(getCanonicalSlug('-wedding-venues-')).toBe('wedding-venues');
      expect(getCanonicalSlug('--photographers--')).toBe('photographers');
    });

    test('handles empty input', () => {
      expect(getCanonicalSlug('')).toBe('');
      expect(getCanonicalSlug('   ')).toBe('');
    });
  });

  describe('validateCategoryName', () => {
    test('validates clean category names', () => {
      expect(validateCategoryName('Wedding Photographers')).toBe(true);
      expect(validateCategoryName('DJs and Bands')).toBe(true);
      expect(validateCategoryName('Makeup Artists')).toBe(true);
    });

    test('rejects duplicated category names', () => {
      expect(validateCategoryName('djs djs and bands')).toBe(false);
      expect(validateCategoryName('photographers photographers')).toBe(false);
      expect(validateCategoryName('venues venues')).toBe(false);
    });

    test('handles case insensitive validation', () => {
      expect(validateCategoryName('DJs DJs and Bands')).toBe(false);
      expect(validateCategoryName('PHOTOGRAPHERS PHOTOGRAPHERS')).toBe(false);
    });

    test('handles empty or invalid input', () => {
      expect(validateCategoryName('')).toBe(false);
      expect(validateCategoryName('   ')).toBe(false);
    });
  });

  describe('getSEOCategoryName', () => {
    test('returns category label when no subcategory', () => {
      expect(getSEOCategoryName('photographers')).toBe('Photographers');
      expect(getSEOCategoryName('venues')).toBe('Venues');
    });

    test('combines category and subcategory properly', () => {
      expect(getSEOCategoryName('photographers', 'wedding')).toBe('Wedding Photographers');
      expect(getSEOCategoryName('venues', 'outdoor')).toBe('Outdoor Venues');
    });

    test('avoids redundancy in combined names', () => {
      expect(getSEOCategoryName('photographers', 'wedding-photographers')).toBe('Wedding Photographers');
      expect(getSEOCategoryName('venues', 'wedding-venues')).toBe('Wedding Venues');
    });

    test('handles DJs special case', () => {
      expect(getSEOCategoryName('djs')).toBe('DJs');
      expect(getSEOCategoryName('djs', 'wedding')).toBe('Wedding DJs');
    });
  });

  describe('hasKnownMapping', () => {
    test('identifies known category mappings', () => {
      expect(hasKnownMapping('photographers')).toBe(true);
      expect(hasKnownMapping('djs')).toBe(true);
      expect(hasKnownMapping('wedding-venues')).toBe(true);
      expect(hasKnownMapping('makeup-artists')).toBe(true);
    });

    test('identifies unknown categories', () => {
      expect(hasKnownMapping('unknown-category')).toBe(false);
      expect(hasKnownMapping('custom-service')).toBe(false);
    });

    test('handles case insensitive matching', () => {
      expect(hasKnownMapping('PHOTOGRAPHERS')).toBe(true);
      expect(hasKnownMapping('DJs')).toBe(true);
    });

    test('handles empty input', () => {
      expect(hasKnownMapping('')).toBe(false);
    });
  });

  describe('getSimilarCategories', () => {
    test('finds similar categories', () => {
      const suggestions = getSimilarCategories('photo');
      expect(suggestions).toContain('Photographers');
      expect(suggestions).toContain('Photo Booth Rentals');
    });

    test('limits results to specified number', () => {
      const suggestions = getSimilarCategories('wedding', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    test('returns empty array for no matches', () => {
      const suggestions = getSimilarCategories('xyz123');
      expect(suggestions).toEqual([]);
    });

    test('handles empty input', () => {
      const suggestions = getSimilarCategories('');
      expect(suggestions).toEqual([]);
    });

    test('removes duplicates from suggestions', () => {
      const suggestions = getSimilarCategories('dj');
      const uniqueSuggestions = [...new Set(suggestions)];
      expect(suggestions).toEqual(uniqueSuggestions);
    });
  });

  describe('getCategoryMappings', () => {
    test('returns a copy of category mappings', () => {
      const mappings = getCategoryMappings();
      expect(mappings).toHaveProperty('photographers');
      expect(mappings).toHaveProperty('djs');
      expect(mappings).toHaveProperty('venues');
    });

    test('returns immutable copy', () => {
      const mappings1 = getCategoryMappings();
      const mappings2 = getCategoryMappings();
      
      // Modify one copy
      mappings1['test'] = 'Test';
      
      // Other copy should be unaffected
      expect(mappings2).not.toHaveProperty('test');
    });
  });

  describe('Integration Tests', () => {
    test('full workflow: slug to label to canonical slug', () => {
      const originalSlug = 'djs-djs-and-bands';
      const label = slugToLabel(originalSlug);
      const canonicalSlug = getCanonicalSlug(label);
      
      expect(label).toBe('DJs and Bands');
      expect(canonicalSlug).toBe('djs-and-bands');
      expect(validateCategoryName(label)).toBe(true);
    });

    test('handles complex duplication scenarios', () => {
      const testCases = [
        {
          input: 'wedding photographers photographers',
          expectedLabel: 'Wedding Photographers',
          expectedSlug: 'wedding-photographers'
        },
        {
          input: 'djs djs and bands and bands',
          expectedLabel: 'DJs and Bands',
          expectedSlug: 'djs-and-bands'
        },
        {
          input: 'venues wedding venues venues',
          expectedLabel: 'Wedding Venues',
          expectedSlug: 'venues-wedding-venues'
        }
      ];

      testCases.forEach(({ input, expectedLabel, expectedSlug }) => {
        const label = slugToLabel(input);
        const slug = getCanonicalSlug(input);
        
        expect(label).toBe(expectedLabel);
        expect(slug).toBe(expectedSlug);
      });
    });

    test('ensures no "djs djs and bands" string ever appears', () => {
      const problematicInputs = [
        'djs djs and bands',
        'DJs DJs and Bands',
        'djs-djs-and-bands',
        'DJSDJSANDBANDS'
      ];

      problematicInputs.forEach(input => {
        const label = slugToLabel(input);
        const slug = getCanonicalSlug(input);
        
        expect(label.toLowerCase()).not.toContain('djs djs');
        expect(slug.toLowerCase()).not.toContain('djs-djs');
        expect(validateCategoryName(label)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles very long category names', () => {
      const longName = 'very-long-category-name-with-many-words-and-hyphens-that-might-cause-issues';
      const label = slugToLabel(longName);
      const slug = getCanonicalSlug(label);
      
      expect(label).toBeTruthy();
      expect(slug).toBeTruthy();
      expect(validateCategoryName(label)).toBe(true);
    });

    test('handles special Unicode characters', () => {
      const unicodeName = 'café-résumé-naïve';
      const label = slugToLabel(unicodeName);
      const slug = getCanonicalSlug(label);
      
      expect(label).toBeTruthy();
      expect(slug).toBeTruthy();
    });

    test('handles numbers in category names', () => {
      const numberName = 'dj-services-24-7';
      const label = slugToLabel(numberName);
      const slug = getCanonicalSlug(label);
      
      expect(label).toBe('Dj Services 24 7');
      expect(slug).toBe('dj-services-24-7');
    });
  });
});
