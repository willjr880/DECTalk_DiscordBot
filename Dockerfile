FROM alpine:latest 
WORKDIR /tmp
ARG GUILD_ID CHANNEL_ID APPLICATION_ID BOT_TOKEN SERVICE_URL SERVICE_APIKEY APP_NODE_ENV
RUN apk --update add --no-cache nodejs npm git ffmpeg && \
    mkdir /service && cd /service && \
    npm install discord.js @discordjs/voice @discordjs/opus sodium-native
COPY main.js config.js package.json ./
RUN mv main.js config.js package.json /service && \
    echo -e "\nconfig.guildID = \"$GUILD_ID\";\nconfig.channelID = \"$CHANNEL_ID\";\nconfig.appID = \"$APPLICATION_ID\";\nconfig.botToken = \"$BOT_TOKEN\";\nconfig.serviceURL = \"$SERVICE_URL\";\nconfig.APIKey = \"$SERVICE_APIKEY\";\nprocess.env.NODE_ENV = \"$APP_NODE_ENV\";" >> /service/config.js && \
    echo -e "#!/bin/sh\nexport NODE_ENV=$APP_NODE_ENV && cd /service && node ." > /start.sh && chmod +x /start.sh
ENTRYPOINT ["/bin/sh", "/start.sh"]
