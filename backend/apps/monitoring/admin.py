from django.contrib import admin
from .models import AuditLog, Announcement

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource_type', 'timestamp', 'ip_address')
    list_filter = ('action', 'resource_type', 'timestamp')
    search_fields = ('user__username', 'resource_id', 'ip_address')
    readonly_fields = ('user', 'action', 'resource_type', 'resource_id', 'changes', 'timestamp', 'ip_address')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('title', 'content')
