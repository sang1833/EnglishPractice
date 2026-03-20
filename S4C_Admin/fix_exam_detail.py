import os

filepath = r'e:\Code\SideProject\Study4Clone\S4C_Admin\src\app\admin\features\exam-detail\exam-detail.component.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The file has a duplicate section from lines 188 to 370 roughly.
# Let's find the exact indices.
# Locate the FIRST "<!-- Create Group Modal -->"
first_modal_idx = -1
for i, line in enumerate(lines):
    if "<!-- Create Group Modal -->" in line:
        first_modal_idx = i
        break

# Locate the SECOND "<!-- Create Group Modal -->"
second_modal_idx = -1
for i in range(first_modal_idx + 1, len(lines)):
    if "<!-- Create Group Modal -->" in line:
        second_modal_idx = i
        break

# Locate the end of the template: "`" which is line 382
template_end_idx = -1
for i in range(second_modal_idx, len(lines)):
    if "    `" in lines[i]:
        template_end_idx = i
        break

if first_modal_idx != -1 and second_modal_idx != -1 and template_end_idx != -1:
    new_lines = lines[:first_modal_idx] + lines[second_modal_idx:template_end_idx]
    
    # After the template, we need to close the @Component decorator and open the class
    class_def = """    `,
})
export class ExamDetailComponent {
   exam: Exam | null = null;
   skills: ExamSkill[] = [];
   selectedSkill: ExamSkill | null = null;
   selectedSection: ExamSection | null = null;
"""
    new_lines.append(class_def)
    new_lines.extend(lines[template_end_idx+1:])
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed exam-detail.component.ts successfully.")
else:
    print(f"Could not find indices: first={first_modal_idx}, second={second_modal_idx}, end={template_end_idx}")
