import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {httpGet} from '../utils/httpget';
import {s3Get} from '../utils/s3get';

interface YamlFile {
  /**
   * Check if file exists.
   * @param location the location of file
   */
  exists(location: string): boolean;
  /**
   * Read file from the `location` and returns the content of file.
   * @param path the location of file
   */
  readFile(location: string): any;
}

/**
 * Load file from local
 */
class LocalFile implements YamlFile {
  private schema: yaml.Schema;

  constructor(schema: yaml.Schema) {
    this.schema = schema;
  }

  exists = (location: string): boolean => {
    console.log(this.resolveFilePath(location));
    return fs.existsSync(this.resolveFilePath(location));
  };

  readFile = (location: string): any => {
    const content = fs.readFileSync(this.resolveFilePath(location), {
      encoding: 'utf-8',
    });

    return yaml.load(content, {schema: this.schema});
  };

  private resolveFilePath = (filePath: string) => {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return path.join(process.cwd(), filePath);
  };
}

/**
 * Load file from `http` or `https` request
 */
class HttpFile implements YamlFile {
  private schema: yaml.Schema;

  constructor(schema: yaml.Schema) {
    this.schema = schema;
  }

  exists = (): boolean => {
    return true;
  };

  readFile = (url: string) => {
    const body = httpGet(url);
    return yaml.load(body, {schema: this.schema});
  };
}

/**
 * Load S3 file
 */
class S3File implements YamlFile {
  private schema: yaml.Schema;

  constructor(schema: yaml.Schema) {
    this.schema = schema;
  }

  exists = (): boolean => {
    return true;
  };

  readFile = (location: string): any => {
    const response = s3Get(location);
    return yaml.load(response, {schema: this.schema});
  };
}

/**
 * Define YAML !include tag
 */
class IncludeTag {
  private kind: 'sequence' | 'scalar' | 'mapping';
  private httpFile: HttpFile;
  private localFile: LocalFile;
  private s3File: S3File;

  constructor(kind: 'sequence' | 'scalar' | 'mapping') {
    this.kind = kind;
    this.httpFile = new HttpFile(yaml.DEFAULT_SCHEMA);
    this.localFile = new LocalFile(yaml.DEFAULT_SCHEMA);
    this.s3File = new S3File(yaml.DEFAULT_SCHEMA);
  }

  useSchema = (schema: yaml.Schema) => {
    this.localFile = new LocalFile(schema);
    this.httpFile = new HttpFile(schema);
    this.s3File = new S3File(schema);
  };

  yamlType = (): yaml.Type => {
    return new yaml.Type('!include', {
      kind: this.kind,
      resolve: (loc: string) => {
        let existed = false;
        if (loc.startsWith('http://') || loc.startsWith('https://')) {
          existed = this.httpFile.exists();
        } else if (loc.startsWith('s3://')) {
          existed = this.s3File.exists();
        } else {
          existed = this.localFile.exists(loc);
        }
        if (!existed) {
          throw new Error(`${loc} is not found`);
        }

        return true;
      },
      construct: (loc: string) => {
        if (loc.startsWith('http://') || loc.startsWith('https://')) {
          return this.httpFile.readFile(loc);
        } else if (loc.startsWith('s3://')) {
          return this.s3File.readFile(loc);
        } else {
          return this.localFile.readFile(loc);
        }
      },
    });
  };
}

/**
 * Extend YAML schema with !include tag
 * @param schema YAML schema
 * @returns YAML schema
 */
export function extend(schema: yaml.Schema) {
  const scalar = new IncludeTag('scalar');
  const sequence = new IncludeTag('sequence');
  const mapping = new IncludeTag('mapping');
  const sch = schema.extend([
    scalar.yamlType(),
    sequence.yamlType(),
    mapping.yamlType(),
  ]);

  scalar.useSchema(sch);
  sequence.useSchema(sch);
  mapping.useSchema(sch);

  return sch;
}
