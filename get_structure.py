import os
from pathlib import Path
from datetime import datetime

def analyze_project_structure(
    root_path='.',
    max_files_to_show=10,
    output_file=None,
    ignore_patterns=None
):
    """
    Анализирует структуру проекта и сохраняет результат в markdown файл,
    игнорируя указанные паттерны директорий и файлов
    
    Args:
        root_path (str): Путь к корневой директории проекта
        max_files_to_show (int): Максимальное количество файлов для отображения в директории
        output_file (str): Путь к файлу для сохранения результата
        ignore_patterns (list): Список паттернов для игнорирования
    """
    # Стандартные паттерны для игнорирования
    default_ignores = {
        'venv',
        'env',
        '.venv',
        '__pycache__',
        '.git',
        'node_modules',
        '.idea',
        '.vscode',
        'dist',
        'build',
        '.pytest_cache',
        'migrations',
        '.DS_Store',
        'get_structure.py'  # Игнорируем сам скрипт
    }
    
    # Объединяем стандартные паттерны с пользовательскими
    if ignore_patterns is None:
        ignore_patterns = default_ignores
    else:
        ignore_patterns = set(ignore_patterns) | default_ignores
    
    # Создаём список для хранения строк вывода
    output_lines = []
    
    def add_line(line):
        """Добавляет строку в output_lines"""
        output_lines.append(line)
    
    def should_ignore(name):
        """Проверяет, должен ли элемент быть проигнорирован"""
        return any(pattern in name for pattern in ignore_patterns)
    
    def print_directory(path, prefix=''):
        try:
            # Получаем список всех элементов в директории, исключая игнорируемые
            items = [item for item in sorted(os.listdir(path)) if not should_ignore(item)]
            
            # Разделяем на файлы и директории
            dirs = [item for item in items if os.path.isdir(os.path.join(path, item))]
            files = [item for item in items if os.path.isfile(os.path.join(path, item))]
            
            # Обрабатываем директории
            for i, dir_name in enumerate(dirs):
                is_last_dir = i == len(dirs) - 1 and len(files) == 0
                current_prefix = '└── ' if is_last_dir else '├── '
                add_line(f"{prefix}{current_prefix}{dir_name}/")
                
                new_prefix = prefix + ('    ' if is_last_dir else '│   ')
                print_directory(os.path.join(path, dir_name), new_prefix)
            
            # Обрабатываем файлы
            if len(files) > max_files_to_show:
                for i, file_name in enumerate(files[:max_files_to_show]):
                    add_line(f"{prefix}├── {file_name}")
                add_line(f"{prefix}└── ... (and {len(files) - max_files_to_show} more files)")
            else:
                for i, file_name in enumerate(files):
                    is_last = i == len(files) - 1
                    current_prefix = '└── ' if is_last else '├── '
                    add_line(f"{prefix}{current_prefix}{file_name}")
                    
        except PermissionError:
            add_line(f"{prefix}└── [Permission Denied]")
        except Exception as e:
            add_line(f"{prefix}└── [Error: {str(e)}]")

    # Получаем абсолютный путь
    root_path = os.path.abspath(root_path)
    
    # Если файл для вывода не указан, создаём имя с текущей датой и временем
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"project_structure_{timestamp}.md"
    elif not output_file.endswith('.md'):
        output_file = f"{output_file}.md"
    
    # Добавляем заголовок в формате Markdown
    add_line(f"# Project Structure")
    add_line(f"\n**Project Path:** `{root_path}`")
    add_line(f"**Generated at:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    add_line(f"**Ignored patterns:** {', '.join(sorted(ignore_patterns))}")
    add_line("\n## Directory Tree")
    add_line("```")
    
    # Начинаем анализ с корневой директории
    print_directory(root_path)
    
    # Закрываем блок кода
    add_line("```")
    
    # Сохраняем результат в файл
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(output_lines))
        print(f"Structure has been saved to: {output_file}")
    except Exception as e:
        print(f"Error saving to file: {str(e)}")

if __name__ == "__main__":
    # Пример использования с дополнительными паттернами для игнорирования
    custom_ignores = {
        'logs',          # игнорировать папки с логами
        '.env',          # игнорировать .env файлы
        '.pyc',          # игнорировать .pyc файлы
    }
    
    analyze_project_structure(ignore_patterns=custom_ignores)