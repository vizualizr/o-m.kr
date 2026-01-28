import os
import sys
import shutil
from datetime import datetime

def backup_file(source_path):
    if not os.path.exists(source_path):
        print(f"Skip: Source file does not exist: {source_path}")
        return True

    # 백업 디렉토리 설정
    backup_root = r"d:\yonggeun\porter\git\o-m.kr\production\.agent\backups"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    file_name = os.path.basename(source_path)
    backup_name = f"{timestamp}_{file_name}.bak"
    backup_path = os.path.join(backup_root, backup_name)

    if not os.path.exists(backup_root):
        os.makedirs(backup_root)

    try:
        shutil.copy2(source_path, backup_path)
        print(f"Success: Backup created at {backup_path}")
        return True
    except Exception as e:
        print(f"Error: Failed to create backup. {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python backup_file.py <file_path>")
        sys.exit(1)

    target = sys.argv[1]
    if backup_file(target):
        sys.exit(0)
    else:
        sys.exit(1)
