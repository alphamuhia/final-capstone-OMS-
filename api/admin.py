from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department, Task, Notification, Message, Salary


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'role', 'department', 'is_superuser', 'is_approved')
    list_filter = ('role', 'is_superuser', 'is_approved')
    actions = ['approve_users']

    def approve_users(self, request, queryset):
        if not request.user.is_superuser:
            self.message_user(request, "You do not have permission to approve users.", level='error')
            return

        queryset.update(is_active=True)
        self.message_user(request, "Selected users have been approved.")

    approve_users.short_description = "Approve selected users"

    def save_model(self, request, obj, form, change):
        if obj.is_superuser:
            obj.role = None 
        super().save_model(request, obj, form, change)

admin.site.register(User, CustomUserAdmin)
admin.site.register(Department)
admin.site.register(Message)
admin.site.register(Salary)


class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_to', 'status', 'due_date', 'created_by')
    list_filter = ('status', 'due_date', 'assigned_to')
    search_fields = ('title', 'assigned_to__username')

admin.site.register(Task, TaskAdmin)

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'message')

admin.site.register(Notification, NotificationAdmin)


# admin.site.register(User)
# admin.site.register(Department)
# admin.site.register(Notification)
# admin.site.register(Task)