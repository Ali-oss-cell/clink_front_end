#!/usr/bin/env python3
"""
Emoji to Icon Conversion Script
Automatically converts emojis to React Icons in TypeScript/TSX files
"""

import re
import os
import sys
from pathlib import Path

# Emoji to Icon mapping
EMOJI_MAP = {
    '📅': ('CalendarIcon', 'md'),
    '🗓️': ('CalendarCheckIcon', 'md'),
    '🎥': ('VideoIcon', 'sm'),
    '👤': ('UserIcon', 'md'),
    '👥': ('UsersIcon', 'md'),
    '👨‍⚕️': ('DoctorIcon', 'md'),
    '👩‍⚕️': ('DoctorIcon', 'md'),
    '📋': ('ClipboardIcon', 'md'),
    '📝': ('NotesIcon', 'md'),
    '📄': ('DocumentIcon', 'md'),
    '✖️': ('CloseIcon', 'sm'),
    '✅': ('CheckCircleIcon', 'md'),
    '❌': ('ErrorCircleIcon', 'md'),
    '⚙️': ('SettingsIcon', 'md'),
    '🏥': ('HospitalIcon', 'md'),
    '💬': ('ChatIcon', 'md'),
    '📞': ('PhoneIcon', 'md'),
    '📧': ('EmailIcon', 'md'),
    '📊': ('ChartIcon', 'md'),
    '📈': ('ChartIcon', 'md'),
    '💳': ('CreditCardIcon', 'md'),
    '💰': ('DollarIcon', 'md'),
    '🔍': ('SearchIcon', 'md'),
    '📚': ('BookIcon', 'md'),
    '📖': ('BookIcon', 'md'),
    '⭐': ('StarIcon', 'sm'),
    '⚠️': ('WarningIcon', 'md'),
    'ℹ️': ('InfoIcon', 'md'),
    '🩺': ('StethoscopeIcon', 'md'),
    '💼': ('MedicalBagIcon', 'md'),
    '🏠': ('HomeIcon', 'md'),
    '🔒': ('LockIcon', 'md'),
    '🔓': ('UnlockIcon', 'md'),
    '🔔': ('BellIcon', 'md'),
    '✏️': ('EditIcon', 'sm'),
    '🗑️': ('DeleteIcon', 'sm'),
    '💾': ('SaveIcon', 'sm'),
    '➕': ('PlusIcon', 'sm'),
    '⏰': ('ClockIcon', 'md'),
    '🔄': ('EditIcon', 'sm'),  # reschedule
}

def find_emojis_in_file(filepath):
    """Find all emojis used in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        emojis_found = set()
        for emoji in EMOJI_MAP.keys():
            if emoji in content:
                emojis_found.add(emoji)
        
        return emojis_found
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return set()

def get_required_imports(emojis):
    """Get the list of icon imports needed"""
    imports = set()
    for emoji in emojis:
        if emoji in EMOJI_MAP:
            icon_name, _ = EMOJI_MAP[emoji]
            imports.add(icon_name)
    return sorted(imports)

def add_icon_imports(content, imports, filepath):
    """Add icon imports to the file"""
    if not imports:
        return content
    
    # Determine the correct import path based on file location
    depth = filepath.count('/src/') 
    if 'pages' in filepath:
        import_path = '../../utils/icons'
    elif 'components' in filepath:
        import_path = '../../utils/icons'
    else:
        import_path = '../utils/icons'
    
    import_statement = f"import {{\n  {',\\n  '.join(imports)}\n}} from '{import_path}';\n"
    
    # Find the last import statement
    import_pattern = r'(import .*?;)\n'
    imports_found = list(re.finditer(import_pattern, content, re.MULTILINE))
    
    if imports_found:
        last_import = imports_found[-1]
        # Insert after the last import
        insert_pos = last_import.end()
        content = content[:insert_pos] + import_statement + content[insert_pos:]
    else:
        # No imports found, add at the beginning after any comments
        content = import_statement + content
    
    return content

def replace_emoji_in_heading(match):
    """Replace emoji in heading (h1-h6)"""
    emoji = match.group(1)
    rest = match.group(2)
    
    if emoji in EMOJI_MAP:
        icon_name, size = EMOJI_MAP[emoji]
        return f'<{icon_name} size="{size}" style={{{{ marginRight: \'8px\', verticalAlign: \'middle\' }}}} /> {rest}'
    return match.group(0)

def replace_emoji_in_button(match):
    """Replace emoji in button text"""
    emoji = match.group(1)
    rest = match.group(2)
    
    if emoji in EMOJI_MAP:
        icon_name, size = EMOJI_MAP[emoji]
        return f'<{icon_name} size="{size}" style={{{{ marginRight: \'6px\' }}}} />\\n          {rest}'
    return match.group(0)

def replace_emoji_standalone(match):
    """Replace standalone emoji"""
    emoji = match.group(1)
    
    if emoji in EMOJI_MAP:
        icon_name, size = EMOJI_MAP[emoji]
        return f'<{icon_name} size="{size}" />'
    return match.group(0)

def convert_file(filepath):
    """Convert emojis to icons in a file"""
    print(f"\\nProcessing: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find all emojis in the file
        emojis_found = find_emojis_in_file(filepath)
        
        if not emojis_found:
            print("  No emojis found")
            return False
        
        print(f"  Found emojis: {', '.join(emojis_found)}")
        
        # Get required imports
        required_imports = get_required_imports(emojis_found)
        print(f"  Required imports: {', '.join(required_imports)}")
        
        # Add imports
        content = add_icon_imports(content, required_imports, filepath)
        
        # Replace emojis in different contexts
        # 1. In headings: <h3>📅 Text</h3>
        for emoji in emojis_found:
            content = re.sub(
                f'<(h[1-6])>\\s*{re.escape(emoji)}\\s+(.*?)</\\1>',
                lambda m: f'<{m.group(1)}>{replace_emoji_in_heading(m)}</{m.group(1)}>',
                content,
                flags=re.MULTILINE
            )
        
        # 2. In buttons and spans
        for emoji in emojis_found:
            if emoji in EMOJI_MAP:
                icon_name, size = EMOJI_MAP[emoji]
                
                # Button text
                content = re.sub(
                    f'>{re.escape(emoji)}\\s+([^<]+)',
                    f'>\\n          <{icon_name} size="{size}" style={{{{ marginRight: \'6px\' }}}} />\\n          \\1',
                    content
                )
                
                # Standalone in divs
                content = re.sub(
                    f'>{re.escape(emoji)}<',
                    f'><{icon_name} size="{size}" /><',
                    content
                )
        
        # Check if any changes were made
        if content != original_content:
            # Backup original file
            backup_path = filepath + '.bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # Write converted content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"  ✅ Converted successfully (backup: {backup_path})")
            return True
        else:
            print(f"  ⚠️  No changes made")
            return False
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python convert-emojis.py <file_or_directory>")
        sys.exit(1)
    
    target = sys.argv[1]
    
    if os.path.isfile(target):
        # Single file
        convert_file(target)
    elif os.path.isdir(target):
        # Directory - find all .tsx files
        tsx_files = list(Path(target).rglob('*.tsx'))
        print(f"Found {len(tsx_files)} .tsx files")
        
        converted = 0
        for filepath in tsx_files:
            if convert_file(str(filepath)):
                converted += 1
        
        print(f"\\n✅ Converted {converted}/{len(tsx_files)} files")
    else:
        print(f"Error: {target} is not a valid file or directory")
        sys.exit(1)

if __name__ == '__main__':
    main()

