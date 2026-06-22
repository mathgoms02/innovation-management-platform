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
        # ORGANIZER só pode editar objetos que lhe pertencem. A "posse" é
        # resolvida por owner direto (organizer/created_by) ou herdada do
        # hackathon ao qual o objeto pertence (ex.: Criterion).
        if request.user.role == 'ORGANIZER':
            return self._owns(obj, request.user)
        return False

    @staticmethod
    def _owns(obj, user):
        owner = getattr(obj, 'organizer', None) or getattr(obj, 'created_by', None)
        if owner is not None:
            return owner == user
        hackathon = getattr(obj, 'hackathon', None)
        if hackathon is not None:
            return hackathon.organizer == user
        # Objeto sem dono identificável: nega para ORGANIZER (apenas ADMIN passa).
        return False
