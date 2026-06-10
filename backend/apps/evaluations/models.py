from django.db import models
from django.conf import settings
from apps.hackathons.models import Hackathon
from apps.submissions.models import Submission

class Criterion(models.Model):
    hackathon = models.ForeignKey(
        Hackathon, 
        on_delete=models.CASCADE, 
        related_name='criteria'
    )
    name = models.CharField(max_length=100)
    weight = models.FloatField(default=1.0, help_text="Peso do critério no cálculo final")

    def __str__(self):
        return f"{self.name} ({self.hackathon.title})"

class Evaluation(models.Model):
    submission = models.ForeignKey(
        Submission, 
        on_delete=models.CASCADE, 
        related_name='evaluations'
    )
    judge = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='evaluations_made'
    )
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('submission', 'judge')

    def __str__(self):
        return f"Evaluation by {self.judge.username} for {self.submission.team.name}"

class Score(models.Model):
    evaluation = models.ForeignKey(
        Evaluation, 
        on_delete=models.CASCADE, 
        related_name='scores'
    )
    criterion = models.ForeignKey(
        Criterion, 
        on_delete=models.CASCADE
    )
    value = models.FloatField(help_text="Nota de 0 a 10")

    class Meta:
        unique_together = ('evaluation', 'criterion')

    def __str__(self):
        return f"{self.criterion.name}: {self.value}"
