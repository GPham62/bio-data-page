# SourceTree — Pull / Sync Setup

Reference for pulling this repo through SourceTree on this machine.

## Repo

- **Remote (origin):** `https://github.com/GPham62/bio-data-page.git`
- **Branch:** `main`
- **Transport:** HTTPS (not SSH)

## How auth actually works here

Pulls succeed **without a password prompt** because Git uses the Windows
**Git Credential Manager**, which stores the GitHub token in Windows
Credential Manager.

```
git config --get credential.helper   ->  manager-core
```

So in SourceTree there is **nothing extra to configure** — it shares the same
HTTPS credential. Just pull.

## Pull in SourceTree

1. Open the repo tab in SourceTree.
2. Toolbar → **Pull**.
3. Remote = `origin`, branch = `main`, leave "fast-forward only" or default.
4. **OK**.

If it ever asks for credentials: username = GitHub username, password =
a **GitHub Personal Access Token** (not the account password). Generate at
GitHub → Settings → Developer settings → Personal access tokens → Tokens
(classic) → scope `repo`. SourceTree stores it after the first success.

### Equivalent from the terminal

```powershell
git pull --ff-only origin main
```

## SSH key (optional — NOT currently used)

The remote is HTTPS, so SSH is not required. For the record:

- An OpenSSH key exists at `~/.ssh/id_rsa` / `id_rsa.pub`, but it is **not
  registered with GitHub** (`ssh -T git@github.com` → "Permission denied").
- SourceTree on Windows uses **PuTTY/Pageant (`.ppk`)** by default; none is set up.

### If you want to switch to SSH later

1. Add the public key to GitHub → Settings → SSH and GPG keys → New SSH key.
   Paste the contents of `~/.ssh/id_rsa.pub`.
2. Verify: `ssh -T git@github.com` → should greet your username.
3. Point SourceTree to OpenSSH: **Tools → Options → General → SSH Client = OpenSSH**.
4. Switch the remote to SSH:
   ```powershell
   git remote set-url origin git@github.com:GPham62/bio-data-page.git
   ```
   (To convert `id_rsa` to a `.ppk` for PuTTY mode instead, use PuTTYgen →
   Load `id_rsa` → Save private key.)

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Pull asks for password repeatedly | Re-enter a valid PAT; let GCM re-save it. |
| `Permission denied (publickey)` | You're on SSH without a registered key — use HTTPS, or register the key above. |
| Local changes block pull | Commit or stash first, then pull. |
| Non-fast-forward / diverged | Pull (merge or rebase) instead of `--ff-only`. |
