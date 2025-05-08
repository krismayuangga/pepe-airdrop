/**
 * Format a translation string with placeholders
 * @param template Translation string with {{placeholders}}
 * @param values Object containing values for placeholders
 * @returns Formatted string with placeholders replaced by values
 * 
 * Example:
 * formatTranslation("Hello {{name}}", { name: "World" }) => "Hello World"
 */
export const formatTranslation = (template: string, values?: Record<string, any>): string => {
  if (!values) return template;
  
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = values[key.trim()];
    return value !== undefined ? String(value) : `{{${key}}}`; 
  });
};
