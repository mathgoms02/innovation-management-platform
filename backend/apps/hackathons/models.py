from django.db import models
from django.conf import settings

class Hackathon(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Rascunho'
        PUBLISHED = 'PUBLISHED', 'Publicado'
        ONGOING = 'ONGOING', 'Em Andamento'
        COMPLETED = 'COMPLETED', 'Concluído'

    title = models.CharField(max_length=200)
    description = models.TextField()
    rules = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    judges = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='hackathons_to_judge',
        blank=True
    )

    def __str__(self):
        return self.title
