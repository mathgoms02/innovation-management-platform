from django.db import models

class Submission(models.Model):
    team = models.OneToOneField(
        'teams.Team',
        on_delete=models.CASCADE,
        related_name='submission'
    )
    description = models.TextField()
    repository_url = models.URLField(max_length=500)
    presentation_url = models.URLField(max_length=500, blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Submission for {self.team.name}"
