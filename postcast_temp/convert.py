#!/usr/bin/env python3
"""
Transcript [MM:SS] to Standard SRT Subtitle Converter
------------------------------------------------------
This utility converts raw text transcripts featuring timestamp cues like [MM:SS]
or [HH:MM:SS] into standard, fully compliant .srt subtitle files.

Usage:
  ./convert.py <input_file.txt> [output_file.srt]

If no arguments are provided, it will scan the current folder for .txt files
and guide you through an interactive conversion!
"""

import os
import sys
import re

def to_srt_time(total_seconds):
    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    s = int(total_seconds % 60)
    ms = int(round((total_seconds - int(total_seconds)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def parse_timestamp(time_str):
    """
    Parses timestamps of formats [MM:SS], [H:MM:SS], [HH:MM:SS]
    """
    time_str = time_str.strip().replace(",", ".")
    parts = time_str.split(":")
    try:
        if len(parts) == 2:
            # MM:SS
            return int(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            # HH:MM:SS
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    except ValueError:
        return None
    return None

def convert_file(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"❌ Error: Input file not found at: {input_path}")
        return False

    print(f"\n📖 Reading transcript from: {os.path.basename(input_path)}")
    with open(input_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Regex patterns
    # 1. Range Pattern: 0:00 - 0:04 Section 3. or [00:00 - 00:04] Hello
    range_pattern = re.compile(r"^\[?(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*)$")
    # 2. Single Pattern: [00:00] Hello or 00:00 Hello
    single_pattern = re.compile(r"^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*)$")

    raw_blocks = []

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue

        # Try matching range first
        range_match = range_pattern.match(line_str)
        if range_match:
            start_sec = parse_timestamp(range_match.group(1))
            end_sec = parse_timestamp(range_match.group(2))
            text = range_match.group(3).strip()
            if start_sec is not None and end_sec is not None:
                raw_blocks.append({
                    "start": start_sec,
                    "end": end_sec,
                    "text": text
                })
            continue

        # Try matching single timestamp next
        single_match = single_pattern.match(line_str)
        if single_match:
            start_sec = parse_timestamp(single_match.group(1))
            text = single_match.group(2).strip()
            if start_sec is not None:
                raw_blocks.append({
                    "start": start_sec,
                    "end": None,
                    "text": text
                })
            continue

        # If neither matches, it is text continuation of the previous block
        if raw_blocks:
            raw_blocks[-1]["text"] += " " + line_str
        else:
            # Fallback if text starts before any timestamp
            raw_blocks.append({
                "start": 0.0,
                "end": None,
                "text": line_str
            })

    if not raw_blocks:
        print("❌ Error: No recognizable timestamp pattern found in the file!")
        return False

    # Sort blocks by start time
    raw_blocks.sort(key=lambda x: x["start"])

    srt_entries = []
    for i in range(len(raw_blocks)):
        start_sec = raw_blocks[i]["start"]
        text = re.sub(r"\s+", " ", raw_blocks[i]["text"]).strip()
        
        # Determine End time
        if raw_blocks[i].get("end") is not None:
            end_sec = raw_blocks[i]["end"]
        elif i < len(raw_blocks) - 1:
            end_sec = raw_blocks[i + 1]["start"]
        else:
            # Last block duration based on word count
            word_count = len(text.split())
            end_sec = start_sec + max(5.0, word_count * 0.4)

        # Safety checking
        if end_sec <= start_sec:
            end_sec = start_sec + 2.0

        start_time_str = to_srt_time(start_sec)
        end_time_str = to_srt_time(end_sec)

        entry = f"{i + 1}\n{start_time_str} --> {end_time_str}\n{text}\n"
        srt_entries.append(entry)

    with open(output_path, "w", encoding="utf-8") as out_f:
        out_f.write("\n".join(srt_entries))

    print(f"✅ Success! Created standard SRT file with {len(raw_blocks)} subtitles.")
    print(f"📂 Saved to: {output_path}\n")
    return True

def main():
    # Scenario 1: Command line arguments provided
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        if len(sys.argv) > 2:
            output_file = sys.argv[2]
        else:
            base, _ = os.path.splitext(input_file)
            output_file = base + ".srt"
        
        convert_file(input_file, output_file)
        return

    # Scenario 2: Interactive mode (No arguments)
    print("====================================================")
    print("🎙️ TRANSCRIPT TO SRT SUBTITLE CONVERTER")
    print("====================================================")
    
    current_dir = os.path.dirname(os.path.abspath(__file__)) if "__file__" in locals() else os.getcwd()
    files = [f for f in os.listdir(current_dir) if f.endswith(".txt") or f.endswith(".srt") and not f.endswith("EnglishPodcast01.srt")]
    
    # Filter only files that have raw format (we exclude already compiled SRTs)
    text_files = []
    for f in os.listdir(current_dir):
        if f.endswith(".txt"):
            text_files.append(f)
        elif f.endswith(".srt"):
            # Check if it's actually raw [MM:SS] text despite srt extension
            try:
                with open(os.path.join(current_dir, f), "r", encoding="utf-8", errors="ignore") as tf:
                    sample = tf.read(500)
                    if "[" in sample and "]" in sample and "-->" not in sample:
                        text_files.append(f)
            except:
                pass

    if not text_files:
        print(f"ℹ️ No raw .txt or timestamped files found in: {current_dir}")
        print("💡 Place your raw transcript file in this folder and run again!")
        print("💡 Or run: python3 convert.py <path_to_file>")
        return

    print("Select a file to convert:")
    for idx, fName in enumerate(text_files):
        print(f"  [{idx + 1}] {fName}")
        
    try:
        choice = input("\nEnter file number (or press Enter to exit): ").strip()
        if not choice:
            return
        
        choice_idx = int(choice) - 1
        if 0 <= choice_idx < len(text_files):
            selected_file = text_files[choice_idx]
            input_path = os.path.join(current_dir, selected_file)
            
            # Formulate output name
            base, _ = os.path.splitext(selected_file)
            output_name = base + "_compiled.srt" if selected_file.endswith(".srt") else base + ".srt"
            output_path = os.path.join(current_dir, output_name)
            
            convert_file(input_path, output_path)
        else:
            print("❌ Invalid selection.")
    except ValueError:
        print("❌ Please enter a valid number.")

if __name__ == "__main__":
    main()
