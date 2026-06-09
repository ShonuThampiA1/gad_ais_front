import json
import re

with open('src/app/knowledge-base/policies/data.json', 'r') as f:
    data = json.load(f)

for key in data:
    content = data[key]['content']
    # The user says "remove unwanted space from sections headings text etc and make the page standard in vertical spacing"
    # We can remove the `<br></br>` tags and just rely on the `space-y-6` wrapper.
    content = content.replace('<br></br>', '')
    content = content.replace('<br/>', '')
    content = content.replace('<br />', '')

    # In user-agreement, we see things like `mt-8 mb-3` on headings. Let's make it standard `mt-6 mb-2`
    content = re.sub(r'mt-8', 'mt-6', content)
    content = re.sub(r'mb-3', 'mb-2', content)

    # In user-agreement there's a big space between 1. Eligibility and its content because of a bunch of <br/> ? Let's check
    # Let's fix the user-agreement specifically if there are large gaps.

    data[key]['content'] = content

with open('src/app/knowledge-base/policies/data.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Fixed JSON margins.")
