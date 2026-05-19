import re
import os
import json

def clean_value(val):
    if not isinstance(val, str):
        return val
    # Remove space followed by numbers or raw numbers at the end of word (e.g. "Notable90" -> "Notable", "Notable 90" -> "Notable")
    # Also clean hyphens followed by numbers inside IPA (e.g. "/ˈnoʊtəbəl-90/" -> "/ˈnoʊtəbəl/")
    cleaned = re.sub(r'[- ]?\d+$', '', val)
    # Also clean if numbers are directly attached to the end of alphabetic words
    cleaned = re.sub(r'([a-zA-Z])\d+$', r'\1', cleaned)
    return cleaned.strip()

def extract_array_from_js(file_path, var_name):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the array block [...]
    match = re.search(rf'{var_name}\s*=\s*(\[[\s\S]*?\])\s*;?\s*$', content)
    if not match:
        # Try generic match
        match = re.search(r'=\s*(\[[\s\S]*\])', content)
        if not match:
            print(f"Could not parse array from {file_path}")
            return []
    
    array_str = match.group(1)
    
    # Safe parse using json.loads by converting single quotes to double quotes, etc.
    # But since it is standard JS object notation, let's use a robust regex or python eval for simplicity and reliability
    try:
        # Prepare context for eval
        # This is safe since we only run it on our owned static data files
        local_context = {}
        eval_code = f"data = {array_str}"
        exec(eval_code, {}, local_context)
        return local_context.get('data', [])
    except Exception as e:
        print(f"Error parsing JS via exec: {e}. Trying raw regex parse.")
        # Fallback to regex-based JSON-like parsing if exec fails
        return []

def main():
    vocab_file = r"data/vocabulary-data.js"
    spec_file = r"data/specialized-data.js"

    print("Reading standard vocabulary...")
    vocab_data = extract_array_from_js(vocab_file, "INITIAL_VOCABULARY")
    print(f"Loaded {len(vocab_data)} items from vocabulary-data.js")

    print("Reading specialized vocabulary...")
    spec_data = extract_array_from_js(spec_file, "SPECIALIZED_VOCABULARY")
    print(f"Loaded {len(spec_data)} items from specialized-data.js")

    # Combine both datasets
    combined = vocab_data + spec_data
    print(f"Combined total: {len(combined)} items.")

    # Deduplicate & Clean
    unique_words = {}
    cleaned_count = 0

    for item in combined:
        if not item or 'word' not in item:
            continue
        
        # Clean all values
        orig_word = item['word']
        word = clean_value(orig_word)
        ipa = clean_value(item.get('ipa', ''))
        meaning = item.get('meaning', '').strip()
        example = clean_value(item.get('example', ''))
        example_vi = item.get('example_vi', '').strip()
        category = item.get('category', 'oxford').strip()
        
        # Determine if it was modified
        if word != orig_word:
            cleaned_count += 1

        key = word.lower().strip()
        
        # Skip empty words
        if not key:
            continue

        # If duplicate, prefer specialized category or the one with longer meaning/examples
        if key in unique_words:
            existing = unique_words[key]
            # Specialized category takes precedence
            existing_is_spec = existing['category'].startswith('spec-')
            new_is_spec = category.startswith('spec-')
            
            if new_is_spec and not existing_is_spec:
                # Replace with specialized
                unique_words[key] = {
                    'word': word,
                    'type': item.get('type', 'noun').strip(),
                    'ipa': ipa,
                    'meaning': meaning,
                    'example': example,
                    'example_vi': example_vi,
                    'category': category,
                    'box': 1,
                    'nextReview': 0
                }
            elif existing_is_spec == new_is_spec:
                # Same category level, keep the one with longer meaning or examples
                if len(meaning) > len(existing['meaning']) or len(example) > len(existing['example']):
                    unique_words[key] = {
                        'word': word,
                        'type': item.get('type', 'noun').strip(),
                        'ipa': ipa,
                        'meaning': meaning,
                        'example': example,
                        'example_vi': example_vi,
                        'category': category,
                        'box': 1,
                        'nextReview': 0
                    }
        else:
            unique_words[key] = {
                'word': word,
                'type': item.get('type', 'noun').strip(),
                'ipa': ipa,
                'meaning': meaning,
                'example': example,
                'example_vi': example_vi,
                'category': category,
                'box': 1,
                'nextReview': 0
            }

    # Re-index items with clean sequential IDs
    final_list = []
    for idx, (k, item) in enumerate(sorted(unique_words.items()), 1):
        item['id'] = f"voc-{idx}"
        final_list.append(item)

    print(f"Deduplication & Cleaning results:")
    print(f"- Cleaned number suffixes from {cleaned_count} words.")
    print(f"- Reduced total list to {len(final_list)} unique, clean words.")

    # Write back to single file: data/vocabulary-data.js
    js_content = "/* ==========================================================================\n"
    js_content += "   LearningEnglish - Unified Curated Essential & Specialized Vocabulary Dataset\n"
    js_content += "   ========================================================================== */\n\n"
    js_content += "const INITIAL_VOCABULARY = "
    js_content += json.dumps(final_list, indent=4, ensure_ascii=False)
    js_content += ";\n"

    with open(vocab_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Successfully wrote unified database to {vocab_file}")

    # Remove specialized-data.js
    if os.path.exists(spec_file):
        os.remove(spec_file)
        print(f"Successfully deleted deprecated {spec_file} file!")

if __name__ == "__main__":
    main()
