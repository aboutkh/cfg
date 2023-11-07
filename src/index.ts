import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as ejs from 'ejs';
import {extend as extendYaml} from './yaml-tags';

const schema = extendYaml(yaml.DEFAULT_SCHEMA);

export interface Options {
  data?: ejs.Data;
  indexFile?: string;
}

export function load(configDir: string, options: Options = {}): any {
  const {indexFile = 'config.yaml'} = options;
  if (configDir.endsWith(indexFile)) {
    configDir = path.dirname(configDir);
  }

  const config: Record<string, any> = {};
  loadBackward(configDir, indexFile, config);

  return config;
}

function loadBackward(
  configDir: string,
  indexFile: string,
  config: Record<string, any>
) {
  const cwd = process.cwd();
  const filePath = path.join(configDir, indexFile);
  if (fs.existsSync(filePath)) {
    Object.assign(config, loadFile(filePath));
  }
  const eof =
    configDir === cwd || configDir === '.' || configDir === '/' || !configDir;
  if (eof) {
    return;
  }

  return loadBackward(path.dirname(configDir), indexFile, config);
}

function loadFile(filePath: string, options?: Options): any {
  const relativePath = path.join(process.cwd(), filePath);
  const template = fs.readFileSync(relativePath, {encoding: 'utf-8'});
  const content = ejs.render(template, options?.data);
  return yaml.load(content, {schema});
}
