FROM node:16 AS builder

# Create app directory
WORKDIR /app

# copy dependency files
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/
COPY src  ./src/  
# Install app dependencies
RUN yarn install
# Required if not done in postinstall
# RUN npx prisma generate

COPY . .

RUN yarn run build

FROM node:16

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
ARG ENV
ENV CI_ENV=${ENV}

ARG SERVER_RELEASE_VERSION
ENV SERVER_RELEASE_VERSION=${SERVER_RELEASE_VERSION}

EXPOSE 3000
CMD ["/bin/sh", "-c", "if [ \"$CI_ENV\" = \"CI\" ]; then npm run start:migrate:ci; else npm run start:migrate:prod; fi"]
# CMD [ "npm", "run", "start:prod" ]
