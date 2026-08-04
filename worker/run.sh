cd /ytrss.github.io
python worker/main.py
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
git add static/history.json
git commit -m "Docker container updated history.json"
git push "https://$GIT_USER_NAME:$GIT_ACCESS_TOKEN@github.com/ytrss/ytrss.github.io.git"