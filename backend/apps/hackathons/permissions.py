from rest_framework import permissions

class IsAdminOrOrganizerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'ORGANIZER']

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == 'ADMIN':
            return True
        # Se for ORGANIZER, só pode editar se for o organizador que criou (se aplicável)
        if request.user.role == 'ORGANIZER':
            if hasattr(obj, 'organizer'):
                return obj.organizer == request.user
            return True # Allow organizer to edit global objects like Announcements for now
        return False
