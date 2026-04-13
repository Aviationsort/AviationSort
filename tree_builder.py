import os
from collections import defaultdict

def build_tree(paths):
    tree = defaultdict(dict)
    for path in paths:
        path = path.strip('./')
        if not path:
            continue
        parts = path.split('/')
        current = tree
        for part in parts[:-1]:
            if part not in current:
                current[part] = defaultdict(dict)
            current = current[part]
        if parts:
            leaf = parts[-1]
            if leaf not in current:
                current[leaf] = {}
    return tree

def print_tree(tree, prefix='', is_last=True):
    items = sorted(tree.items())
    for i, (name, subtree) in enumerate(items):
        is_last_item = i == len(items) - 1
        connector = '-- ' if is_last_item else '+- '
        print(prefix + connector + name)
        if isinstance(subtree, dict):
            extension = '   ' if is_last_item else '|  '
            print_tree(subtree, prefix + extension, is_last_item)

if __name__ == '__main__':
    with open('C:\\Users\\useer\\.local\\share\\kilo\\tool-output\\tool_d8830a144001UyNi7jem9p0qq0', 'r') as f:
        paths = [line.strip() for line in f if line.strip()]
    tree = build_tree(paths)
    print_tree(tree)