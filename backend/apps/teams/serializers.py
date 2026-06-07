from rest_framework import serializers
from .models import Team, TeamMember
from django.contrib.auth import get_user_model

User = get_user_model()

class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TeamMember
        fields = ('id', 'user', 'username', 'joined_at')

class TeamSerializer(serializers.ModelSerializer):
    leader_username = serializers.CharField(source='leader.username', read_only=True)
    members_count = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model = Team
        fields = ('id', 'name', 'hackathon', 'leader', 'leader_username', 'members_count', 'created_at')
        read_only_fields = ('id', 'leader', 'created_at')

    def validate(self, data):
        user = self.context['request'].user
        hackathon = data['hackathon']
        
        # Check if user is already in a team for this hackathon
        if Team.objects.filter(hackathon=hackathon, members=user).exists():
            raise serializers.ValidationError("Você já faz parte de uma equipe neste hackathon.")
            
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['leader'] = user
        team = super().create(validated_data)
        TeamMember.objects.create(team=team, user=user)
        return team
