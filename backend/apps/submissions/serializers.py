from rest_framework import serializers
from .models import Submission
from apps.teams.models import Team

class SubmissionSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')
    hackathon_id = serializers.ReadOnlyField(source='team.hackathon.id')
    # OneToOne adiciona um UniqueValidator implícito que conflita com o padrão
    # update-or-create (o time pode já ter submissão). Removemos o validador;
    # a unicidade segue garantida no nível do modelo/serviço.
    team = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), validators=[])

    class Meta:
        model = Submission
        fields = ['id', 'team', 'team_name', 'hackathon_id', 'description', 'repository_url', 'presentation_url', 'submitted_at']
        read_only_fields = ('submitted_at',)
