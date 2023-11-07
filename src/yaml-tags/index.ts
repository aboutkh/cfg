import * as yaml from 'js-yaml';
import {extend as extendInclude} from './include';

/**
 * Extend YAML schema
 * @param schema YAML schema
 * @returns YAML schema
 */
export function extend(sch: yaml.Schema) {
  const schema = extendInclude(sch);

  return schema;
}
