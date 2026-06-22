from rest_framework import serializers
from .models import Criterion, Evaluation, Score

class CriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criterion
        fields = ['id', 'hackathon', 'name', 'weight']

class ScoreSerializer(serializers.ModelSerializer):
    criterion_name = serializers.ReadOnlyField(source='criterion.name')
    
    class Meta:
        model = Score
        fields = ['criterion', 'criterion_name', 'value']

class EvaluationSerializer(serializers.ModelSerializer):
    scores = ScoreSerializer(many=True, read_only=True)
    judge_name = serializers.ReadOnlyField(source='judge.username')
    team_name = serializers.ReadOnlyField(source='submission.team.name')
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'submission', 'team_name', 'judge', 
            'judge_name', 'scores', 'comments', 'created_at'
        ]
        read_only_fields = ['judge', 'created_at']

class ScoreInputSerializer(serializers.Serializer):
    criterion_id = serializers.IntegerField()
    value = serializers.FloatField(min_value=0, max_value=10)

class EvaluationCreateSerializer(serializers.Serializer):
    submission_id = serializers.IntegerField()
    scores = ScoreInputSerializer(many=True)
    comments = serializers.CharField(required=False, allow_blank=True, allow_null=True)
