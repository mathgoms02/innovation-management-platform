from django.contrib import admin
from .models import Criterion, Evaluation, Score

@admin.register(Criterion)
class CriterionAdmin(admin.ModelAdmin):
    list_display = ('name', 'hackathon', 'weight')
    list_filter = ('hackathon',)
    search_fields = ('name', 'hackathon__title')

class ScoreInline(admin.TabularInline):
    model = Score
    extra = 0

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('submission', 'judge', 'created_at')
    list_filter = ('judge', 'submission__team__hackathon')
    inlines = [ScoreInline]

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('evaluation', 'criterion', 'value')
    list_filter = ('criterion__hackathon', 'criterion')
