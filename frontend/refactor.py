import os
import re

directory = 'c:/Users/USER/Desktop/ak-son/frontend/src'

replacements = [
    (r'bg-\[\#0a0f1d\]', 'bg-slate-50 dark:bg-[#0a0f1d]'),
    (r'bg-\[\#121826\]', 'bg-white dark:bg-[#121826]'),
    (r'bg-\[\#161b2c\]', 'bg-slate-100 dark:bg-[#161b2c]'),
    (r'bg-\[\#1a2035\]', 'bg-slate-100 dark:bg-[#1a2035]'),
    (r'bg-\[\#1a1f2e\]', 'bg-slate-100 dark:bg-[#1a1f2e]'),
    (r'bg-\[\#0d1117\]', 'bg-slate-50 dark:bg-[#0d1117]'),
    (r'bg-\[\#121723\]', 'bg-white dark:bg-[#121723]'),
    (r'bg-\[\#0c1120\]', 'bg-slate-50 dark:bg-[#0c1120]'),
    (r'bg-white/5', 'bg-black/5 dark:bg-white/5'),
    (r'bg-white/10', 'bg-black/10 dark:bg-white/10'),
    (r'bg-white/20', 'bg-black/20 dark:bg-white/20'),
    (r'border-white/5', 'border-black/5 dark:border-white/5'),
    (r'border-white/10', 'border-black/10 dark:border-white/10'),
    (r'border-white/20', 'border-black/20 dark:border-white/20'),
    (r'text-slate-400', 'text-slate-600 dark:text-slate-400'),
    (r'text-slate-300', 'text-slate-700 dark:text-slate-300'),
    (r'text-slate-200', 'text-slate-800 dark:text-slate-200'),
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements:
                new_content = re.sub(old, new, new_content)
                
            # Akıllı text-white değişimi: 
            # Eğer text-white bg-red, bg-blue, bg-green, bg-indigo vb. ile aynı class string'inde ise DOKUNMA
            # Değilse text-slate-900 dark:text-white yap
            
            def replace_text_white(match):
                class_str = match.group(0)
                if re.search(r'bg-(red|blue|green|indigo|purple|pink|yellow|orange|teal)-[56789]00', class_str) or 'from-red' in class_str or 'bg-gradient' in class_str:
                    return class_str
                # Sadece text-white olanları değiştir
                return re.sub(r'\btext-white\b', 'text-slate-900 dark:text-white', class_str)
                
            new_content = re.sub(r'className=(?:\"[^\"]+\"|\'[^\']+\'|{[^]+})', replace_text_white, new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filepath}")
print('Done!')
