from django.db import models

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

    def __str__(self):
        return self.title
