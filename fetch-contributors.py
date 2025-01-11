import re
import sys
import requests
import json

BASE_API_URL = 'https://api.github.com/repos/DishpitDev/Slopify'


def fetch_contributors():
    page = 1
    fetched_contributors = []
    all_contributors = []

    while page == 1 or fetched_contributors:
        url = f'{BASE_API_URL}/contributors?per_page=100&page={page}'
        response = requests.get(url)
        fetched_contributors = response.json()
        all_contributors += fetched_contributors
        page += 1

    return all_contributors


def get_rounded_img_url(url, size=64):
    return f'https://images.weserv.nl/?url={url}?h={size}&w={size}&fit=cover&mask=circle'


def create_contributor_badge(contributor):
    return f'<a href="{contributor["html_url"]}"><img src="{get_rounded_img_url(contributor["avatar_url"])}" alt="{contributor["login"]}"></a>'


def modify_readme(contributors):
    with open('README.md', 'r', encoding='utf-8') as f:
        readme = f.read()

    badges = '\n'.join([create_contributor_badge(contributor) for contributor in contributors])

    readme = re.sub(r'<!-- CONTRIBUTORS:START -->.*<!-- CONTRIBUTORS:END -->',
                    f'<!-- CONTRIBUTORS:START -->\n# Contributors ({len(contributors)})\n\n{badges}\n<!-- CONTRIBUTORS:END -->',
                    readme, flags=re.DOTALL)

    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(readme)


def main():
    contributors = fetch_contributors()
    with open('contributors.json', 'w') as f:
        json.dump(contributors, f)

    if '--readme' in sys.argv:
        modify_readme(contributors)


if __name__ == '__main__':
    main()
