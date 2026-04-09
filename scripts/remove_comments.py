import os
import re

def strip_comments(code):
    # Regex to match strings/regexes/urls first so they are skipped, then match comments
    # Group 1: Double-quoted strings
    # Group 2: Single-quoted strings
    # Group 3: Template literals (backtick)
    # Group 4: URLs (http:// or https://)
    # Group 5: Multi-line comments /* ... */
    # Group 6: Single-line comments // ...
    
    pattern = re.compile(
        r'("(?:\\.|[^"\\])*")|'          # 1. Double quotes
        r"('(?:\\.|[^'\\])*')|"          # 2. Single quotes
        r'(`(?:\\.|[^`\\])*`)|'          # 3. Template literals
        r'(https?://[^\s\'"<>`]+)|'      # 4. URLs
        r'(/\*[\s\S]*?\*/)|'             # 5. Block comments
        r'(//.*)'                        # 6. Line comments
    )
    
    def replacer(match):
        if match.group(5) is not None:
            return '' # strip block comment
        elif match.group(6) is not None:
            return '' # strip line comment
        else:
            return match.group(0) # keep the matched string/url
            
    # Apply regex
    return pattern.sub(replacer, code)

def main():
    # Remove from parent directory since the script is in scripts/
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    exts = ('.js', '.jsx', '.ts', '.tsx', '.css', '.html')
    ignore_dirs = {'node_modules', 'dist', 'build', '.git', '.vscode'}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        for file in filenames:
            if file.endswith(exts):
                filepath = os.path.join(dirpath, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = strip_comments(content)
                
                # Cleanup the JSX empty expressions if it's safe (only for `{}`)
                # BUT skipping this string replace to be completely safe against breaking code like useState({})
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Stripped comments from: {filepath}")

if __name__ == '__main__':
    main()
