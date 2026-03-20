filepath = r'e:\Code\SideProject\Study4Clone\S4C_Admin\src\app\admin\features\exam-detail\exam-detail.component.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Delete lines 184 to 369 (0-indexed: 183 to 368)
# In python slices, list[183:369] gets these elements.
del lines[183:369]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)
