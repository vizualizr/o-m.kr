---
description: Backup and restore agent artifacts
---

# Backup Brain Artifacts

Run this PowerShell command to back up the agent's brain artifacts (task list, plans, guides) to your local project folder `.agent/brain_backup`. This allows you to commit them to Git.

```powershell
$source = "C:\Users\onlin\.gemini\antigravity\brain\38bb9f7c-f23b-44a6-94e5-cc0715572113"
$dest = ".agent/brain_backup"
New-Item -ItemType Directory -Force -Path $dest
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
Write-Host "Backup complete to $dest"
```

# Restore Brain Artifacts

**WARNING**: This will overwrite the current agent memory with the backup.

```powershell
$source = ".agent/brain_backup"
$dest = "C:\Users\onlin\.gemini\antigravity\brain\38bb9f7c-f23b-44a6-94e5-cc0715572113"
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
Write-Host "Restore complete from $source"
```
