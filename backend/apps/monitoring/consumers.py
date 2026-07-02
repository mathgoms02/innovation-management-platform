import json
from channels.generic.websocket import AsyncWebsocketConsumer

# Group that every authenticated connection joins, used for platform-wide
# broadcasts (e.g. global announcements).
BROADCAST_GROUP = "notifications_broadcast"


def user_group_name(user_id):
    """Per-user notification group name."""
    return f"notifications_{user_id}"


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        # Reject anonymous / unauthenticated connections.
        if user is None or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.groups_joined = [BROADCAST_GROUP, user_group_name(user.id)]
        for group in self.groups_joined:
            await self.channel_layer.group_add(group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        for group in getattr(self, "groups_joined", []):
            await self.channel_layer.group_discard(group, self.channel_name)

    # Receive message from a group and forward it to the client.
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))
