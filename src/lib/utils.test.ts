import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge multiple class names into a single string', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes correctly', () => {
    expect(cn('base', { 'is-active': true, 'is-hidden': false })).toBe('base is-active');
  });

  it('should remove falsy values', () => {
    expect(cn('class1', false, 'class2', null, undefined, 0)).toBe('class1 class2');
  });

  it('should override conflicting tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'text-white', 'bg-blue-500')).toBe('text-white bg-blue-500');
  });

  it('should handle a mix of strings, objects, and falsy values', () => {
    expect(cn('p-4', null, { 'm-2': true }, 'bg-red-500', 'bg-blue-500')).toBe('p-4 m-2 bg-blue-500');
  });
});
