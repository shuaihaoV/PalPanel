<div align="center">
<h1 align="center">PalPanel</h1>

简体中文 / [English](./README_EN.md)

PalPanel 是基于Next.js实现的帕鲁服务器管理面板。通过RCON协议，管理员可以轻松管理服务器，执行各种操作，包括用户管理、黑名单维护、存档保存等功能。

![logo](./public/logo.png)

</div>

## 特性

- **在线用户管理**：查看当前在线用户，执行封禁或踢出操作。
- **可视化Steam信息**：查看在线用户的Steam账户信息。
- **黑名单管理**：轻松添加或移除黑名单条目。
- **实时banlist.txt生成**：实时生成封禁名单文件,可结合帕鲁服务器配置远程banlist.txt
- **游戏广播**：向所有玩家发送游戏内广播消息。
- **游戏存档保存**：备份游戏存档，确保游戏数据安全。
- **关闭服务器**：当需要时，可以安全地关闭游戏服务器。

## 使用说明

使用PalPanel之前，您需要确保您的游戏服务器已启用RCON协议。配置好PalPanel面板后，您可以执行以下操作：

1. 查看在线用户：在PalPanel中，您可以看到所有在线玩家的列表，并进行管理。
2. 管理黑名单：通过简单的界面添加或移除用户到黑名单。
3. 发送游戏广播：使用广播功能，您可以发送消息到游戏中，通知或者提醒玩家。
4. 保存游戏存档：定期或在必要时手动保存游戏存档。
5. 关闭服务器：在维护或更新游戏时，您可能需要关闭服务器，PalPanel提供了这一功能。

![palpanel-example-zh.png](./.assets/palpanel-example-zh.png)

## 环境变量

>  PalPanel项目需要一些环境变量才能正常运行。
>
> 请确保在部署或本地开发之前设置这些环境变量。

- `RCON_HOST`: RCON服务器的主机名或IP地址。
- `RCON_PORT`: RCON服务器的端口号。
- `RCON_PASSWORD`: RCON服务器的密码。
- `AUTH_SECRET`: 用于身份验证的密钥,请使用`openssl rand -base64 32` 生成
- `WEB_USERNAME`: 网站管理员的用户名(明文)。
- `WEB_PASSWORD`: 网站管理员的密码的`SHA256`哈希值,可在线生成 [SHA256 Generator](https://tools.keycdn.com/sha256-online-generator)
- `STEAM_API_KEY`: Steam API的密钥,请前往[Steam官方申请](https://steamcommunity.com/dev/apikey)。
  请将这些环境变量添加到您的项目中。您可以使用.env文件或部署平台的配置界面来设置这些变量。

## 部署指南

### 1. Docker部署方式

```bash
# 生成AUTH_SECRET
AUTH_SECRET=`openssl rand -base64 32`
WEB_PASSWORD=`echo -n "密码" | sha256sum | awk '{print $1}'`
# Docker启动
docker run -d \
  --name PalPanel \
  -p 80:3000 \
  -e RCON_HOST=RCON服务器域名或IP \
  -e RCON_PORT=RCON服务器端口 \
  -e RCON_PASSWORD=RCON连接密码 \
  -e AUTH_SECRET=$AUTH_SECRET\
  -e WEB_USERNAME=面板用户名 \
  -e WEB_PASSWORD=$WEB_PASSWORD \
  -e STEAM_API_KEY=STEAM密钥 \
  shuaihaov/palpanel:latest
```

### 2. Docker Compose部署

```bash
mkdir palpanel && cd palpanel
wget https://github.com/shuaihaoV/PalPanel/raw/main/docker-compose.yml
wget https://raw.githubusercontent.com/shuaihaoV/PalPanel/main/.env

# 修改.env
vim .env

# docker compose 启动
docker compose up -d
# 部分版本使用 docker-compose up -d 
```

## 多语言支持

本项目支持国际化（i18n），可以轻松适配多种语言环境，确保不同语言的用户都能使用PalPanel进行服务器管理。

欢迎将 [locales/](https://github.com/shuaihaoV/PalPanel/tree/main/locales/) 中的json文件翻译成你的语言，并提出PR请求。

## 贡献

如果您想为PalPanel贡献代码或提供反馈，请遵循以下步骤：

1. Fork 项目仓库。
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 将您的更改推送到分支 (`git push origin feature/AmazingFeature`)。
5. 打开一个Pull Request。

## 支持

如果您在使用PalPanel时遇到问题或需要帮助，请通过以下方式联系我们：

- 在本项目的 [Issues](https://github.com/shuaihaoV/PalPanel/issues) 页面提交问题

## 项目依赖

- [Next.js](https://nextjs.org/) - 用于构建应用程序的React框架。
- [radix-ui](https://radix-ui.com/) - 用于构建UI的React组件库。

## 致谢

- 参考了[Bluefissure/pal-conf](https://github.com/Bluefissure/pal-conf/tree/main)项目的部分前端实现

