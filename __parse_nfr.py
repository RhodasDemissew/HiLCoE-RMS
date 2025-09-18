import re
from pathlib import Path
lines = Path('final_doc_processed.txt').read_text(encoding='utf-8').splitlines()
nfrs = []
for i,line in enumerate(lines):
    if line.strip().startswith('NFR') and line.strip()[3:].split()[0].isdigit():
        idx = line.strip().split()[0]
        desc = lines[i+2].strip() if i+2 < len(lines) else ''
        nfrs.append((idx, desc))
print('\n'.join(f"{idx}: {desc}" for idx, desc in nfrs))
