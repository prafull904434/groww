export interface FieldInfo {
  path: string;
  type: string;
  value: any;
  sampleValue: string;
}

export function exploreFields(obj: any, path: string = "", maxDepth: number = 5): FieldInfo[] {
  const fields: FieldInfo[] = [];
  
  if (maxDepth <= 0) return fields;
  
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      const itemFields = exploreFields(obj[0], path, maxDepth - 1);
      fields.push(...itemFields);
    }
  } else if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      if (value === null || value === undefined) {
        fields.push({
          path: currentPath,
          type: "null",
          value: null,
          sampleValue: "null"
        });
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === "object" && firstItem !== null) {
            const itemFields = exploreFields(firstItem, currentPath + "[0]", maxDepth - 1);
            fields.push(...itemFields);
          } else {
            fields.push({
              path: currentPath,
              type: `array[${typeof firstItem}]`,
              value: value,
              sampleValue: String(value[0])
            });
          }
        } else {
          fields.push({
            path: currentPath,
            type: "array",
            value: [],
            sampleValue: "[]"
          });
        }
      } else if (typeof value === "object") {
        const nestedFields = exploreFields(value, currentPath, maxDepth - 1);
        fields.push(...nestedFields);
      } else {
        fields.push({
          path: currentPath,
          type: typeof value,
          value: value,
          sampleValue: String(value)
        });
      }
    });
  }
  
  return fields;
}

export function getFieldValue(data: any, path: string): any {
  const parts = path.split(".");
  let current = data;
  
  for (const part of parts) {
    if (part.includes("[")) {
      const [key, index] = part.split("[");
      const idx = parseInt(index.replace("]", ""));
      current = current?.[key]?.[idx];
    } else {
      current = current?.[part];
    }
    
    if (current === undefined || current === null) {
      return null;
    }
  }
  
  return current;
}

