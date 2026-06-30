# 🚀 Quick Start with PNPM

## ⚡ One-Command Migration

```powershell
# Run the automated migration script
.\scripts\migrate-to-pnpm.ps1
```

This script will:
- ✅ Check/install PNPM
- ✅ Remove old npm dependencies
- ✅ Clean build artifacts
- ✅ Install with PNPM
- ✅ Verify installation

---

## 📦 Manual Installation (Alternative)

### 1. Install PNPM

```powershell
# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# Or via npm
npm install -g pnpm@latest
```

### 2. Clean Old Dependencies

```powershell
# Remove node_modules
rmdir /s /q node_modules
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules

# Remove lock files
del package-lock.json
del backend\package-lock.json
del frontend\package-lock.json
```

### 3. Install Dependencies

```powershell
pnpm install
```

---

## 🎯 Common Commands

### Development
```powershell
# Start both backend & frontend
pnpm run dev

# Start backend only
pnpm --filter backend dev

# Start frontend only
pnpm --filter frontend dev
```

### Building
```powershell
# Build everything
pnpm run build

# Build backend only
pnpm run build:backend

# Build frontend only
pnpm run build:frontend

# Analyze bundle size
pnpm run analyze
```

### Cleaning
```powershell
# Clean cache and build artifacts
pnpm run clean:cache

# Clean specific workspace
pnpm --filter backend clean
pnpm --filter frontend clean

# Deep clean (including node_modules)
pnpm run clean
```

### Dependencies
```powershell
# Add dependency to backend
pnpm --filter backend add express

# Add dev dependency to frontend
pnpm --filter frontend add -D @types/node

# Update all dependencies
pnpm up --recursive

# Check for outdated
pnpm outdated --recursive
```

---

## 📊 Size Comparison

### Before (NPM)
```
📦 Total: ~487 MB
├── root/node_modules:     ~50 MB
├── backend/node_modules:  ~200 MB
└── frontend/node_modules: ~200 MB
```

### After (PNPM)
```
📦 Total: ~150 MB (70% smaller!)
├── Global store:  ~120-150 MB (shared)
├── root/links:    <1 MB
├── backend/links: <1 MB
└── frontend/links: <1 MB
```

---

## ✅ Verification Checklist

After migration, verify:

- [ ] `pnpm --version` works
- [ ] `node_modules` folders exist in all 3 locations
- [ ] `pnpm-lock.yaml` exists in root
- [ ] No `package-lock.json` files remain
- [ ] `pnpm run dev` starts successfully
- [ ] Backend runs on http://localhost:3001
- [ ] Frontend runs on http://localhost:3000

---

## 🔍 Troubleshooting

### "pnpm: command not found"
```powershell
# Restart terminal after installing
# Or add to PATH manually
```

### "Peer dependency warnings"
```powershell
# PNPM is stricter - this is normal
# Add to .npmrc if needed:
strict-peer-dependencies=false
```

### "Module not found"
```powershell
# Regenerate node_modules
pnpm install --force
```

### "Prisma Client not found"
```powershell
cd backend
pnpm exec prisma generate
```

---

## 🎓 Key Differences from NPM

| Command | NPM | PNPM |
|---------|-----|------|
| Install | `npm install` | `pnpm install` |
| Add pkg | `npm install pkg` | `pnpm add pkg` |
| Add dev | `npm install -D pkg` | `pnpm add -D pkg` |
| Remove | `npm uninstall pkg` | `pnpm remove pkg` |
| Run script | `npm run dev` | `pnpm run dev` |
| Exec bin | `npx prisma` | `pnpm exec prisma` |
| Workspace | `npm run dev -w backend` | `pnpm --filter backend dev` |

---

## 📚 Learn More

- [PNPM Documentation](https://pnpm.io/)
- [PNPM vs NPM vs Yarn](https://pnpm.io/benchmarks)
- [Workspace Guide](https://pnpm.io/workspaces)

---

**Need help?** See full documentation in `OPTIMIZATION.md`
