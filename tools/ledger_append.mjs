#!/usr/bin/env node
// The sanctioned way to append a verdict row to a ledger TSV.
// Shell printf mangled backslashes in Windows paths into control bytes three
// times in one run; rows are now built here in JS and the whole file is
// re-validated after every append, with rollback on any failure.

import { appendFileSync, existsSync, readFileSync, statSync, truncateSync } from 'node:fs';

const HEADER = 'timestamp\tunit\tbranch\thead_sha\tverdict\tevidence';
const FIELD_COUNT = 6;

const CONTROL_NAMES = {
  0: 'NUL',
  7: 'bell',
  8: 'backspace',
  11: 'vertical tab',
  12: 'form feed',
  13: 'carriage return',
  26: 'substitute',
  27: 'escape',
  127: 'delete',
};

function fail(message, code = 1) {
  process.stderr.write(`ERROR: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const flags = new Set(['--file', '--unit', '--branch', '--head', '--verdict', '--evidence', '--check']);
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!flags.has(arg)) fail(`unknown argument: ${arg}`, 2);
    const value = argv[++i];
    if (value === undefined) fail(`${arg} requires a value`, 2);
    const key = arg.slice(2);
    if (args[key] !== undefined) fail(`${arg} given twice`, 2);
    args[key] = value;
  }
  return args;
}

function describeControl(code) {
  return CONTROL_NAMES[code] ?? 'control';
}

// Pure validator. Returns a list of problems; an empty list means the
// content is a valid ledger. An empty string is a valid empty ledger.
export function validate(content) {
  const problems = [];
  if (content === '') return problems;

  const lines = content.split('\n');
  if (content.endsWith('\n')) lines.pop();

  if (lines[0] !== HEADER) {
    problems.push(`line 1: header mismatch, expected ${JSON.stringify(HEADER)}, found ${JSON.stringify(lines[0])}`);
  }

  lines.forEach((line, index) => {
    const fieldCount = line.split('\t').length;
    if (fieldCount !== FIELD_COUNT) {
      problems.push(`line ${index + 1}: expected ${FIELD_COUNT} tab-separated fields, found ${fieldCount}`);
    }
    for (let col = 0; col < line.length; col++) {
      const code = line.charCodeAt(col);
      if ((code < 0x20 && code !== 0x09 && code !== 0x0a) || code === 0x7f) {
        problems.push(
          `line ${index + 1} col ${col + 1}: control character U+${code.toString(16).padStart(4, '0')} (${describeControl(code)})`,
        );
      }
    }
  });

  return problems;
}

// Boundary check on caller-supplied fields: no empty fields and no control
// characters at all, since any of them would break the row invariant.
function validateFields(fields) {
  const problems = [];
  fields.forEach((field, index) => {
    if (field === '') {
      problems.push(`field ${index + 1}: empty`);
    }
    for (let col = 0; col < field.length; col++) {
      const code = field.charCodeAt(col);
      if ((code < 0x20 && code !== 0x09) || code === 0x7f) {
        problems.push(
          `field ${index + 1} col ${col + 1}: control character U+${code.toString(16).padStart(4, '0')} (${describeControl(code)})`,
        );
      }
    }
    if (field.includes('\t')) {
      problems.push(`field ${index + 1} col ${field.indexOf('\t') + 1}: tab inside a field would split the row`);
    }
  });
  return problems;
}

function runCheck(file) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (error) {
    fail(`cannot read ${file}: ${error.message}`);
  }
  const problems = validate(content);
  if (problems.length > 0) {
    process.stderr.write(`INVALID: ${file}\n`);
    problems.forEach((problem) => process.stderr.write(`  ${problem}\n`));
    process.exit(1);
  }
  const lines = content.split('\n');
  if (content.endsWith('\n')) lines.pop();
  const rows = lines.length === 0 ? 0 : lines.length - 1;
  const backslashFields = content
    .split('\n')
    .slice(1)
    .filter((line) => line.includes('\\')).length;
  process.stdout.write(`OK: ${file} parses clean: header + ${rows} rows, all valid (${backslashFields} rows carry backslashes, preserved as data)\n`);
}

function runAppend(args) {
  const fields = [args.unit, args.branch, args.head, args.verdict, args.evidence];
  const inputProblems = validateFields(fields);
  if (inputProblems.length > 0 || !args.file) {
    process.stderr.write('ERROR: invalid input\n');
    if (!args.file) process.stderr.write('  --file requires a value\n');
    inputProblems.forEach((problem) => process.stderr.write(`  ${problem}\n`));
    process.exit(2);
  }

  const file = args.file;
  const exists = existsSync(file);
  const original = exists ? readFileSync(file, 'utf8') : '';
  const originalBytes = exists ? statSync(file).size : 0;

  const preProblems = validate(original);
  if (preProblems.length > 0) {
    process.stderr.write(`ERROR: refusing to append to an invalid ledger: ${file}\n`);
    preProblems.forEach((problem) => process.stderr.write(`  ${problem}\n`));
    process.exit(1);
  }

  const timestamp = new Date().toISOString();
  const row = [timestamp, ...fields].join('\t');
  const payload =
    (original === '' ? `${HEADER}\n` : original.endsWith('\n') ? '' : '\n') + `${row}\n`;

  appendFileSync(file, payload, 'utf8');

  // Append-then-validate: re-read from disk so the check sees the real bytes.
  const after = readFileSync(file, 'utf8');
  const problems = validate(after);
  const lastLine = after.endsWith('\n') ? after.slice(0, -1).split('\n').pop() : after.split('\n').pop();
  const storedFields = lastLine.split('\t');
  if (JSON.stringify(storedFields) !== JSON.stringify([timestamp, ...fields])) {
    problems.push(`round-trip mismatch: stored row ${JSON.stringify(storedFields)} != built row ${JSON.stringify([timestamp, ...fields])}`);
  }

  if (problems.length > 0) {
    process.stderr.write(`ERROR: validation failed after append to ${file}\n`);
    problems.forEach((problem) => process.stderr.write(`  ${problem}\n`));
    try {
      truncateSync(file, originalBytes);
      process.stderr.write(`  rolled back to previous ${originalBytes} bytes\n`);
    } catch (error) {
      process.stderr.write(`  ROLLBACK FAILED (${error.message}); file left at ${statSync(file).size} bytes, repair by hand\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`${row}\n`);
  process.stdout.write(`OK: appended 1 row to ${file}, whole-file validation passed\n`);
}

function usage() {
  process.stderr.write(`Usage:
  node tools/ledger_append.mjs --file <ledger.tsv> --unit <unit> --branch <branch> --head <sha> --verdict <verdict> --evidence <path>
  node tools/ledger_append.mjs --check <ledger.tsv>
`);
}

const args = parseArgs(process.argv.slice(2));

if (args.check !== undefined) {
  const rest = Object.keys(args).filter((key) => key !== 'check');
  if (rest.length > 0) fail(`--check cannot be combined with: ${rest.join(' ')}`, 2);
  runCheck(args.check);
} else if (args.file) {
  runAppend(args);
} else {
  usage();
  process.exit(2);
}
