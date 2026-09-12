# GitHub Account Switching Guide

This guide explains how to switch between two GitHub accounts (Afp123r and fyp1234566) using SSH keys.

## Current Setup

Your SSH configuration is located at `C:\Users\User\.ssh\config` and currently looks like this:

```
Host github.com-fyp
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_fyp
    IdentitiesOnly yes

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
```

### SSH Keys Overview

- **id_rsa** → Currently linked to **Afp123r** account
- **id_ed25519_fyp** → Currently linked to **fyp1234566** account

## How to Switch Accounts

### Method 1: Switch Default Account (Most Common)

To change which account is used by default for all GitHub repositories:

1. **Open your SSH config file:**
   ```powershell
   notepad C:\Users\User\.ssh\config
   ```

2. **Edit the `github.com` section:**
   - For **Afp123r**: Set `IdentityFile ~/.ssh/id_rsa`
   - For **fyp1234566**: Set `IdentityFile ~/.ssh/id_ed25519_fyp`

3. **Save the file**

4. **Test the connection:**
   ```powershell
   ssh -T git@github.com
   ```
   You should see: `Hi [username]! You've successfully authenticated...`

### Method 2: Use Account-Specific Hosts (Advanced)

You can use both accounts simultaneously by using different host aliases:

**For Afp123r repositories:**
```bash
git remote set-url origin git@github.com:Afp123r/repo-name.git
```

**For fyp1234566 repositories:**
```bash
git remote set-url origin git@github.com-fyp:fyp1234566/repo-name.git
```

Note the `github.com-fyp` alias for the fyp account.

## Quick Reference Commands

### Check Current SSH Authentication
```powershell
ssh -T git@github.com
```

### Check Current Git Configuration
```powershell
git config --global user.name
git config --global user.email
```

### Switch to Afp123r Account
1. Edit `C:\Users\User\.ssh\config`
2. Change `IdentityFile ~/.ssh/id_rsa` in the `github.com` section
3. Test: `ssh -T git@github.com`

### Switch to fyp1234566 Account
1. Edit `C:\Users\User\.ssh\config`
2. Change `IdentityFile ~/.ssh/id_ed25519_fyp` in the `github.com` section
3. Test: `ssh -T git@github.com`

## Troubleshooting

### Permission Denied Error
If you get `ERROR: Permission to Afp123r/portfolio1.git denied to fyp1234566`:
- Your SSH is authenticating as the wrong account
- Follow the steps above to switch SSH keys
- Test with `ssh -T git@github.com` to verify

### Multiple SSH Keys in Agent
If SSH is using the wrong key, clear the SSH agent:
```powershell
ssh-add -D
ssh-add ~/.ssh/id_rsa  # or whichever key you want to use
```

### Repository-Specific Configuration
You can also set different git config per repository:
```powershell
cd path/to/repo
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

## Summary

- **Default account**: Controlled by the `github.com` section in SSH config
- **Afp123r key**: `~/.ssh/id_rsa`
- **fyp1234566 key**: `~/.ssh/id_ed25519_fyp`
- **Always test**: Run `ssh -T git@github.com` after switching
