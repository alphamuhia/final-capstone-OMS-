from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

class IsManager(BasePermission):
    """
    Allows access only to managers.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == "manager"

class IsEmployee(BasePermission):
    """
    Allows access to employees only.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role in ["assistant_manager", "team_leader", "employee"]
