import re
from pathlib import Path
text = Path('final_doc_processed.txt').read_text(encoding='utf-8')
lines = [line.strip() for line in text.splitlines()]
use_cases = []
current = None
key = None
for line in lines:
    if line == 'Use Case ID':
        if current:
            use_cases.append(current)
        current = {'Use Case ID': None}
        key = 'Use Case ID'
        continue
    if current is None:
        continue
    if line.startswith('UC') and key == 'Use Case ID':
        current['Use Case ID'] = line
        key = None
        continue
    if line == 'Use Case Name':
        key = 'Use Case Name'
        continue
    if key == 'Use Case Name' and line:
        current['Use Case Name'] = line
        key = None
        continue
    if line in {'Actors','Description','Preconditions','Postconditions','Main Flow','Alternate Flow(s)','Exceptions','Business rule'}:
        key = line
        current[key] = [] if key in {'Main Flow','Alternate Flow(s)'} else ''
        continue
    if key == 'Main Flow' and line:
        current['Main Flow'].append(line)
        continue
    if key == 'Alternate Flow(s)' and line:
        current['Alternate Flow(s)'].append(line)
        continue
    if key and line:
        if isinstance(current[key], list):
            current[key].append(line)
        else:
            if current[key]:
                current[key] += ' ' + line
            else:
                current[key] = line
for uc in use_cases:
    print(f"{uc.get('Use Case ID')} - {uc.get('Use Case Name')}")
    print(f"  Actors: {uc.get('Actors')}")
    print(f"  Description: {uc.get('Description')}")
    if 'Main Flow' in uc:
        print(f"  Main Flow: {uc['Main Flow'][:3] + ['...'] if len(uc['Main Flow'])>3 else uc['Main Flow']}")
    if 'Alternate Flow(s)' in uc:
        print(f"  Alternate: {uc['Alternate Flow(s)'][:2] + ['...'] if len(uc['Alternate Flow(s)'])>2 else uc['Alternate Flow(s)']}")
    print()
