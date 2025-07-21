import * as fs from 'node:fs';
import type { TupleKey } from '@openfga/sdk';
import { parse } from 'yaml';

import fgaClient from '#server/lib/openfga.ts';

const OPENFGA_DIR = './openfga';
const CORE_TUPLES_PATH = `${OPENFGA_DIR}/core-tuples.yaml`;
const TODO_TUPLES_PATH = `${OPENFGA_DIR}/todo.fga.yaml`;

interface TodoTuples {
  tuples: TupleKey[];
}

const coreFile = fs.readFileSync(CORE_TUPLES_PATH, 'utf-8');
const coreTuples = parse(coreFile) as TupleKey[];
console.log('Core tuples:', coreTuples);

const todoFile = fs.readFileSync(TODO_TUPLES_PATH, 'utf-8');
const todoTuples = parse(todoFile) as TodoTuples;
console.log('Todo tuples:', todoTuples.tuples);

(async () => {
  await fgaClient.write({
    writes: [...coreTuples, ...todoTuples.tuples],
  });
})();
