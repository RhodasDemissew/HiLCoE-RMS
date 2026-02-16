# 🧹 Deployment Cleanup & Security Checklist

## Files to Remove/Ignore

### 1. **Backup Files (.bak)** - Remove these
- `CLIENT/src/features/coordinatorDashboard/components/TemplatesWorkspace.jsx.bak`
- `API/src/controllers/researcherStages.controller.js.bak`

### 2. **Python Cache Files** - Should be ignored
- `CHECKER/app/__pycache__/` (all .pyc files)

### 3. **Temporary/Debug Files** - Consider removing
- `__parse_doc.py`
- `__parse_nfr.py`
- `__parse_usecases.py`
- `__tmp_head.txt`
- `__tmp_read_doc.py`
- `temp_patch.diff`
- `documentation_extracted.txt`
- `final_doc_processed.txt`

### 4. **Old/Unused Files** - Consider removing
- `API/__old_index.js`
- `API/__old_seed.js`

### 5. **Build Artifacts** - Should be ignored (already in .gitignore)
- `dist/` folders
- `node_modules/`
- `.vite/`

## Security Checks

### ✅ Already Protected (Good!)
- `.env` files are in .gitignore
- `storage/` folders are ignored
- `node_modules/` are ignored

### ⚠️ Check for Hardcoded Secrets
- No API keys in code ✅
- No passwords in code ✅
- No database credentials in code ✅

## Files to Create/Update

### 1. **Create .env.example files**
- `API/.env.example` - Template for backend env vars
- `CLIENT/.env.example` - Template for frontend env vars

### 2. **Update .gitignore**
- Add Python cache patterns
- Add backup file patterns
- Add temporary file patterns

### 3. **Create README for deployment**
- Document environment variables
- Document deployment process

## Recommended Actions

1. ✅ Remove backup files (.bak)
2. ✅ Update .gitignore for Python cache
3. ✅ Create .env.example files
4. ✅ Remove temporary files (optional)
5. ✅ Commit cleanup changes

