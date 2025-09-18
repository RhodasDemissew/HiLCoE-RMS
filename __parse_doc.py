import re
from pathlib import Path
text = Path('final_doc_processed.txt').read_text(encoding='utf-8')
lines = text.splitlines()
frs = []
for i,line in enumerate(lines):
    m = re.fullmatch(r'FR(\d+)', line.strip())
    if m:
        req = lines[i+2].strip() if i+2 < len(lines) else ''
        frs.append((int(m.group(1)), req))
print('Functional Requirements:')
for num, req in frs:
    print(f'FR{num}: {req}')
print('\nUse Cases:')
for i,line in enumerate(lines):
    if line.strip() == 'Use Case Name':
        name = lines[i+1].strip() if i+1 < len(lines) else ''
        uc_id = ''
        for back in range(i-1, max(-1, i-5), -1):
            if lines[back].strip().startswith('Use Case ID'):
                uc_id = lines[back+1].strip()
                break
        print(f'{uc_id}: {name}')
