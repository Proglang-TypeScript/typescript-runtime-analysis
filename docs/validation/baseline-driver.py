import io
import json
import pathlib
import subprocess
import tarfile
import time
import sys

docker = ['docker', '--host', 'unix:///Users/thiemann/.colima/default/docker.sock']
sources = pathlib.Path('work/sources')
logs = pathlib.Path('work/baselines')
logs.mkdir(parents=True, exist_ok=True)
checks = {
    'ts-declaration-file-generator': [('install', 'npm ci --ignore-scripts --no-fund --no-audit'), ('build', 'npm run build'), ('unit', 'npm test -- --runInBand'), ('integration', 'npm run test:e2e -- --runInBand'), ('lint', 'npm run lint'), ('format', 'npx --no-install prettier --check "src/**/*.ts"'), ('audit', 'npm audit --json')],
    'run-time-information-gathering': [('install', 'npm ci --ignore-scripts --no-fund --no-audit'), ('lint', 'npm run lint'), ('audit', 'npm audit --json')],
    'js-code-pattern-discovery': [('install', 'npm ci --ignore-scripts --no-fund --no-audit'), ('build', 'npm run build'), ('test', 'npm test'), ('audit', 'npm audit --json')],
    'ts-ast-utils': [('install', 'npm ci --ignore-scripts --no-fund --no-audit'), ('build', 'npm run build'), ('test', 'npm test -- --runInBand'), ('audit', 'npm audit --json')],
}
checks['declaration-compare'] = [('install', 'npm ci --ignore-scripts --legacy-peer-deps --no-fund --no-audit'), ('build', 'npm run build'), ('test', 'npm test -- --runInBand'), ('audit', 'npm audit --json')]
checks['tracer-runtime'] = [('install', 'npm ci --ignore-scripts --no-fund --no-audit && npm install --no-save --ignore-scripts --no-audit jalangi2@0.2.6'), ('setup', 'cp jalangi-commands/jalangi.js node_modules/jalangi2/src/js/commands/jalangi.js'), ('runtime', 'KAFKA_ENABLED=false sh bin/run tests/calculator/calculator.js blacklisted.json')]
checks['ts-visitors'] = [('install', 'npm ci --ignore-scripts --no-fund --no-audit'), ('setup', 'npm run install:featherweight'), ('build', 'npm run build'), ('test', 'npm test'), ('audit', 'npm audit --json')]
checks['concrete-types'] = [('install', 'npm ci --ignore-scripts --no-fund --no-audit'), ('compile', 'npx --no-install tsc --noEmit public/src/main_creating.ts'), ('test', 'npm test'), ('audit', 'npm audit --json')]
records = []
for name, steps in checks.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]:
        continue
    source = sources / name
    if name == 'declaration-compare':
        source = sources / 'dts-generate-method/9_compare/dts-compare'
    if name == 'tracer-runtime':
        source = sources / 'run-time-information-gathering'
    if name == 'concrete-types':
        source = pathlib.Path('/Users/thiemann/git/typescript/concrete-types/AST-Tree')
    archive = io.BytesIO()
    with tarfile.open(fileobj=archive, mode='w') as tar:
        for path in source.rglob('*'):
            relative = path.relative_to(source)
            if path.is_file() and '.git' not in relative.parts and 'node_modules' not in relative.parts:
                tar.add(path, arcname=str(relative), recursive=False)
    script = 'mkdir -p /tmp/app; cd /tmp/app; tar xf -; node --version; npm --version; '
    for label, command in steps:
        script += f'printf "\\nCHECK {label}\\n"; {command}; result=$?; printf "RESULT {label} %s\\n" "$result"; '
        if label == 'install':
            script += 'if [ "$result" != 0 ]; then exit "$result"; fi; '
    started = time.monotonic()
    result = subprocess.run(docker + ['run', '--rm', '-i', '--user', 'node', '--cpus=2', '--memory=2g', '--pids-limit=256', '--cap-drop=ALL', '--security-opt=no-new-privileges', 'node:16-bullseye-slim', 'sh', '-c', script], input=archive.getvalue(), capture_output=True, timeout=600)
    output = result.stdout.decode(errors='replace') + result.stderr.decode(errors='replace')
    (logs / f'{name}.log').write_text(output)
    (logs / f'{name}-results.json').write_text(json.dumps({'steps': steps, 'seconds': round(time.monotonic() - started, 2), 'exit': result.returncode}, indent=2))
    record = {'repository': name, 'image': 'node:16-bullseye-slim', 'seconds': round(time.monotonic() - started, 2), 'container_exit': result.returncode, 'checks': [line for line in output.splitlines() if line.startswith('RESULT ')]}
    records.append(record)
    (logs / ('additional-results.json' if len(sys.argv) > 1 else 'results.json')).write_text(json.dumps(records, indent=2))
    print(json.dumps(record), flush=True)
