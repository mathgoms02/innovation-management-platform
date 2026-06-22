from rest_framework import serializers
from .models import Team, TeamMember, TeamJoinRequest
from django.contrib.auth import get_user_model
from .services import TeamService

User = get_user_model()

class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TeamMember
        fields = ('id', 'user', 'username', 'joined_at')

class TeamJoinRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = TeamJoinRequest
        fields = ('id', 'team', 'team_name', 'user', 'username', 'status', 'created_at')
        read_only_fields = fields

class TeamSerializer(serializers.ModelSerializer):
    leader_username = serializers.CharField(source='leader.username', read_only=True)
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    members = TeamMemberSerializer(source='teammember_set', many=True, read_only=True)
    is_leader = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            'id', 'name', 'hackathon', 'leader', 'leader_username',
            'members_count', 'members', 'is_leader', 'created_at'
        )
        read_only_fields = ('id', 'leader', 'created_at')

    def get_is_leader(self, obj):
        request = self.context.get('request')
        return bool(request and obj.leader_id == request.user.id)

    def create(self, validated_data):
        user = self.context['request'].user
        return TeamService.create_team(
            hackathon=validated_data['hackathon'],
            name=validated_data['name'],
            leader=user
        )

    def update(self, instance, validated_data):
        return TeamService.update_team(instance, validated_data.get('name', instance.name))
