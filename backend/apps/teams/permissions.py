from rest_framework import permissions


class IsTeamLeaderOrReadOnly(permissions.BasePermission):
    """
    Leitura liberada para qualquer usuário autenticado.
    Edição/exclusão da equipe restritas ao líder (ADMIN faz bypass).
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.role == 'ADMIN':
            return True

        return obj.leader_id == request.user.id
