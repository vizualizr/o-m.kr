import os
import sys

def check_path(target_path):
    # 1. 절대 경로 여부 확인
    if not os.path.isabs(target_path):
        return False, f"Error: Path must be absolute. Received: {target_path}"

    # 2. 작업 공간 확인 및 예외 처리
    # 윈도우 환경이므로 대소문자 구분 없이 처리
    workspace_prod = r"d:\yonggeun\porter\git\o-m.kr\production".lower()
    workspace_journal = r"d:\yonggeun\porter\git\o-m.kr\journal".lower()
    brain_path = r"C:\Users\onlin\.gemini\antigravity\brain".lower()
    normalized_path = os.path.normpath(target_path).lower()

    # 아티팩트(brain) 폴더 내의 경로는 무조건 안전한 것으로 간주
    if normalized_path.startswith(brain_path):
        return True, "Safe: Domain of artifacts (Brain)."

    # 3. 금지된 디렉토리 패턴 확인 (User Rules 준수)
    # .gemini 패턴은 위에서 brain_path로 체크되지 않은 경우에만 금지
    forbidden_patterns = ["\\Desktop\\", "/Desktop/", "\\tmp\\", "/tmp/", "\\.gemini\\", "/.gemini/"]
    for pattern in forbidden_patterns:
        if pattern.lower() in target_path.lower():
            return False, f"Error: Writing to forbidden directory pattern '{pattern}' is not allowed."

    # 4. 일반 작업 공간 확인
    if normalized_path.startswith(workspace_prod) or normalized_path.startswith(workspace_journal):
        status = "Safe"
    else:
        return False, f"Error: Target path is outside the allowed workspace: {target_path}"

    # 5. 존재 여부 확인 (충돌 방지용)
    exists = os.path.exists(target_path)
    exist_msg = " [EXISTS]" if exists else " [NEW]"
    
    return True, f"{status}: Path is valid.{exist_msg}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_path.py <absolute_path>")
        sys.exit(1)

    path_to_check = sys.argv[1]
    is_safe, message = check_path(path_to_check)
    
    print(message)
    if is_safe:
        sys.exit(0)
    else:
        sys.exit(1)
