"""Fix specialized-data.js: remove all duplicated words (those with number suffixes)."""
import re

with open("data/specialized-data.js", "r", encoding="utf-8") as f:
    content = f.read()

# Parse the JS array using regex to extract each object block
pattern = r'\{[^}]+\}'
matches = re.findall(pattern, content, re.DOTALL)

kept = []
seen_words = set()

for block in matches:
    # Extract word field
    word_match = re.search(r'"word":\s*"([^"]+)"', block)
    if not word_match:
        continue
    word = word_match.group(1)
    
    # Skip words with number suffix like "Algorithm 2", "Variable 3"
    if re.search(r'\s\d+$', word):
        continue
    
    # Skip exact duplicates
    word_lower = word.lower()
    if word_lower in seen_words:
        continue
    seen_words.add(word_lower)
    
    kept.append(block)

print(f"Kept {len(kept)} unique words out of {len(matches)} total")

# Rebuild the file
with open("data/specialized-data.js", "w", encoding="utf-8") as f:
    f.write("/* ==========================================================================\n")
    f.write("   LearningEnglish - Specialized Vocabulary Dataset (Unique Words Only)\n")
    f.write("   ========================================================================== */\n\n")
    f.write("const SPECIALIZED_VOCABULARY = [\n")
    
    # Re-index IDs
    id_counter = 1
    for i, block in enumerate(kept):
        # Extract category prefix
        cat_match = re.search(r'"category":\s*"spec-(\w+)"', block)
        prefix = cat_match.group(1) if cat_match else "unknown"
        
        # Replace the ID
        new_block = re.sub(r'"id":\s*"[^"]+"', f'"id": "spec-{prefix}-{id_counter}"', block)
        id_counter += 1
        
        f.write("    " + new_block)
        if i < len(kept) - 1:
            f.write(",")
        f.write("\n")
    
    f.write("];\n")

# Count by category
cats = {}
for block in kept:
    cat_match = re.search(r'"category":\s*"(spec-\w+)"', block)
    if cat_match:
        cat = cat_match.group(1)
        cats[cat] = cats.get(cat, 0) + 1

print("By category:", cats)
