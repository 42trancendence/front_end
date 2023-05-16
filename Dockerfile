FROM node:bullseye

# nginx를 통해 바깥이랑 연결되니까 이건 필요 없음
# EXPOSE 4000

COPY ./ /usr/local/transpong_fe/
WORKDIR /usr/local/transpong_fe/
# image로 만들 때 실행되는
RUN npm install
RUN npm run build

# image를 container로 만들 때 실행되는
CMD ["sh", "./entrypoint.sh"]
# https://nextjs.org/learn/basics/deploying-nextjs-app/other-hosting-options