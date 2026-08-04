FROM debian:stable-slim
WORKDIR /ytrss.github.io
COPY . .
ENV PATH="/ytrss.github.io/venv/bin:$PATH"
ENV GIT_USER_NAME="git_user_name"
ENV GIT_USER_EMAIL="git_user_email"
ENV GIT_ACCESS_TOKEN="git_access_token"
RUN apt-get update
RUN apt-get install -y python3 python3-venv tini cron git
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*
RUN python3 -m venv venv
RUN pip install --no-cache-dir -r worker/requirements.txt
RUN chmod +x worker/run.sh
RUN crontab < worker/schedule
ENTRYPOINT ["tini", "--"]
CMD ["cron", "-f"]