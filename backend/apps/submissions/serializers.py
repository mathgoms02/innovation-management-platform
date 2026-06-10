from rest_framework import serializers
from .models import Submission

class SubmissionSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')
    hackathon_id = serializers.ReadOnlyField(source='team.hackathon.id')
    
    class Meta:
        model = Submission
        fields = ['id', 'team', 'team_name', 'hackathon_id', 'description', 'repository_url', 'presentation_url', 'submitted_at']
        read_only_fields = ('submitted_at',)
