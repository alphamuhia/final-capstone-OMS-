import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
        else:
            self.user_group = f"user_{user.id}"
            await self.channel_layer.group_add(self.user_group, self.channel_name)
            await self.channel_layer.group_add("broadcast", self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard("broadcast", self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))
