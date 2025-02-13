from rest_framework.permissions import BasePermission
from rest_framework import permissions


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

class IsSenderOrRecipientOrPublic(permissions.BasePermission):
    """
    Custom permission:
      - For safe methods: allow access if the notification is public (broadcast)
        or if the request user is the sender or recipient.
      - For unsafe methods: only allow if the request user is the sender or recipient.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            if obj.recipient is None:
                return True
            return obj.sender == request.user or obj.recipient == request.user
        
        return obj.sender == request.user or obj.recipient == request.user