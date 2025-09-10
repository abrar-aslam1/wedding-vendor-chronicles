import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://findmyweddingvendor.com',
    href: 'https://findmyweddingvendor.com',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock document methods for SEO tests
Object.defineProperty(document, 'title', {
  value: '',
  writable: true
});

// Mock querySelector for meta tags
const originalQuerySelector = document.querySelector;
document.querySelector = function(selector: string) {
  if (selector.includes('meta[name="description"]')) {
    return {
      getAttribute: () => 'Test description',
      setAttribute: () => {},
    } as any;
  }
  return originalQuerySelector.call(this, selector);
};

// Setup DOM globals
beforeAll(() => {
  // Any global setup
});

afterEach(() => {
  // Clean up after each test
  document.title = '';
});

afterAll(() => {
  // Clean up after all tests
});
