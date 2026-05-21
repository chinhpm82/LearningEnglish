import re
from datetime import datetime, timedelta

def parse_time(time_str):
    """Chuyển đổi chuỗi thời gian SRT (HH:MM:SS,mmm) thành đối tượng timedelta."""
    return datetime.strptime(time_str.strip(), "%H:%M:%S,%f") - datetime.strptime("00:00:00,000", "%H:%M:%S,%f")

def format_time(td):
    """Chuyển đổi đối tượng timedelta thành chuỗi thời gian SRT."""
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    milliseconds = int(td.microseconds / 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def merge_srt_files(file1_path, file2_path, output_path):
    # Biểu thức chính quy để tìm mốc thời gian trong file SRT
    time_pattern = re.compile(r"(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})")
    
    # --- BƯỚC 1: Đọc File 1 và tìm mốc thời gian kết thúc cuối cùng ---
    with open(file1_path, 'r', encoding='utf-8') as f1:
        file1_content = f1.read()
    
    all_f1_times = time_pattern.findall(file1_content)
    if not all_f1_times:
        print("Khong tim thay moc thoi gian hop le trong File 1.")
        return
    
    # Lấy mốc thời gian kết thúc của sub cuối cùng trong File 1
    last_f1_end_str = all_f1_times[-1][1]
    offset_delta = parse_time(last_f1_end_str)
    
    print(f"File 1 ket thuc tai: {last_f1_end_str}. Se dung moc nay de cong don cho File 2.")

    # --- BƯỚC 2: Chuẩn hóa nội dung File 1 (Loại bỏ các tag lỗi như nếu có) ---
    # (Hàm làm sạch này giúp loại bỏ các ký tự thừa từ text thô bạn copy từ prompt)
    clean_f1_content = file1_content.replace("'", "")
    f1_blocks = clean_f1_content.strip().split('\n\n')
    
    merged_blocks = []
    sub_index = 1
    
    for block in f1_blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 2 and time_pattern.match(lines[1]):
            # Cập nhật lại số thứ tự subtitle cho tuần tự
            lines[0] = str(sub_index)
            merged_blocks.append('\n'.join(lines))
            sub_index += 1

    # --- BƯỚC 3: Đọc File 2, dịch chuyển thời gian và nối vào danh sách ---
    with open(file2_path, 'r', encoding='utf-8') as f2:
        file2_content = f2.read()
        
    clean_f2_content = file2_content.replace("'", "")
    f2_blocks = clean_f2_content.strip().split('\n\n')
    
    for block in f2_blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 2:
            match = time_pattern.match(lines[1])
            if match:
                # Lấy thời gian gốc của File 2
                start_time = parse_time(match.group(1))
                end_time = parse_time(match.group(2))
                
                # Cộng dồn với thời gian kết thúc của File 1
                new_start = start_time + offset_delta
                new_end = end_time + offset_delta
                
                # Cập nhật lại dòng thời gian và số thứ tự
                lines[0] = str(sub_index)
                lines[1] = f"{format_time(new_start)} --> {format_time(new_end)}"
                
                merged_blocks.append('\n'.join(lines))
                sub_index += 1

    # --- BƯỚC 4: Ghi ra file đầu ra hoàn chỉnh ---
    with open(output_path, 'w', encoding='utf-8') as out_file:
        out_file.write('\n\n'.join(merged_blocks) + '\n')
        
    print(f"Da ghep thanh cong! File moi duoc luu tai: {output_path}")

if __name__ == "__main__":
    import sys
    import os
    
    if len(sys.argv) < 3:
        print("Cach dung: python merge.py <file1.srt> <file2.srt> [output.srt]")
        sys.exit(1)
        
    file1 = sys.argv[1]
    file2 = sys.argv[2]
    
    if len(sys.argv) >= 4:
        output = sys.argv[3]
    else:
        # Tự động tạo tên file đã ghép nếu không chỉ định
        base_name = os.path.splitext(file1)[0]
        output = f"{base_name}_merged.srt"
        
    merge_srt_files(file1, file2, output)