import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as ejs from 'ejs';
import * as glob from 'glob';
import {extend as extendYaml} from './yaml-tags';
import {mergeDeep} from './utils/mergedeep';

const schema = extendYaml(yaml.DEFAULT_SCHEMA);

export interface Options {
  data?: ejs.Data;
}

export function load(
  configDir: string,
  options: Options = {}
): Record<string, unknown> {
  if (fs.statSync(configDir).isFile()) {
    configDir = path.dirname(configDir);
  }

  let config: Record<string, unknown> = {};
  const configFiles = listConfigFiles(configDir);
  configFiles.forEach(configFile => {
    config = mergeDeep(config, loadFile(configFile, options));
  });

  return config;
}

function listConfigFiles(configDir: string): string[] {
  if (!fs.existsSync(configDir)) {
    return [];
  }

  const configFiles = [];
  const cwd = process.cwd();
  const parts = configDir.split('/');
  for (let i = 0; i < parts.length; i += 1) {
    const configPattern = path.join(
      cwd,
      parts.slice(0, i + 1).join('/'),
      '*(*.json|*.yaml|*.yml)'
    );
    const files = glob.sync(configPattern);
    configFiles.push(...files);
  }

  return configFiles;
}

function loadFile(filePath: string, options?: Options) {
  const template = fs.readFileSync(filePath, {encoding: 'utf-8'});
  const content = ejs.render(template, options?.data);
  return yaml.load(content, {schema}) || {};
}
