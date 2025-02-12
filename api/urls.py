# from django.urls import path
# from . import views
# from rest_framework.routers import DefaultRouter
# from .views import (
#     RegisterView, 
#     LoginView, 
#     ApproveUserView, 
#     DepartmentListView, 
#     PayrollViewSet,
#     UserProfileView, 
#     AssignRoleView, 
#     MarkNotificationReadView,
#     ListNotificationsView,
#     EmployeeProfileView,
#     CreateTaskView,
#     DepartmentReportView,
#     ListEmployeeTasksView,
#     TaskAssignView,
#     NotificationListView,
#     MarkNotificationAsReadView,
#     SendMessageView,
#     ListMessagesView,
#     UpdateTaskStatusView,
#     DepartmentDetailView,
#     TaskReportView,
#     # DepartmentReportListView,
# )

# router = DefaultRouter()
# router.register(r'admin/payrolls', PayrollViewSet, basename='payrolls')

# urlpatterns = router.urls

# urlpatterns = [
#     path('register/', RegisterView.as_view(), name='register'),
#     path("profile/", UserProfileView.as_view(), name="user-profile"),
#     path('login/', LoginView.as_view(), name='login'),
#     path('users/', views.user_list, name="all-users"),
#     path('users/<int:user_id>/', views.user_list, name='user-detail'),
#     path('users/department/<int:department>/', views.user_list_by_department, name="all-users"),
#     path("approve-user/<int:user_id>/", ApproveUserView.as_view(), name="approve-user"),
#     path("assign-role/<int:user_id>/", AssignRoleView.as_view(), name="assign-role"),
#     path("employee-profile/", EmployeeProfileView.as_view(), name="employee-profile"),
#     path("create-task/", CreateTaskView.as_view(), name="create-task"),
#     path("notifications/", NotificationListView.as_view(), name="list-notifications"),
#     path("notifications/read/<int:notification_id>/", MarkNotificationAsReadView.as_view(), name="mark-notification-read"),
#     path("send-message/", SendMessageView.as_view(), name="send-message"),
#     path("messages/", ListMessagesView.as_view(), name="list-messages"),
#     path("notifications/", ListNotificationsView.as_view(), name="list-notifications"),
#     path("notifications/<int:notification_id>/read/", MarkNotificationReadView.as_view(), name="mark-notification-read"),
#     path("tasks/", ListEmployeeTasksView.as_view(), name="list-employee-tasks"),
#     path("task-report/", TaskReportView.as_view(), name="task-report"),
#     path("tasks/<int:task_id>/update-status/", UpdateTaskStatusView.as_view(), name="update-task-status"),
#     path("assign-task/", views.TaskAssignView, name="assign-task"),
#     # path('departments/', views.DepartmentListView, name='departments'),
#     # path('departments/<int:department_id>/', views.DepartmentListView, name='department-detail'),
#     path('departments/', DepartmentListView.as_view(), name='departments'),
#     path('departments/<int:id>/', DepartmentDetailView.as_view(), name='department-detail'),
#     path("department-reports/", DepartmentReportView.as_view(), name="department-reports"),
#     # path("department-reports/", views.DepartmentReportView, name="department-reports"),
# ]


from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    RegisterView, 
    LoginView, 
    ApproveUserView, 
    DepartmentListView, 
    PayrollViewSet,
    UserProfileView, 
    AssignRoleView, 
    MarkNotificationReadView,
    ListNotificationsView,
    EmployeeProfileView,
    CreateTaskView,
    DepartmentReportView,
    ListEmployeeTasksView,
    # TaskAssignView,
    # MarkNotificationAsReadView,
    SendMessageView,
    ListMessagesView,
    UpdateTaskStatusView,
    DepartmentDetailView,
    TaskReportView,
    SalaryListCreateView,
    SalaryDetailView,
    ClockView,
    AttendanceSummaryView,
    LeaveRequestViewSet,
    AdvancePaymentRequestViewSet,
    UserViewSet,
    RoleViewSet,
)

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'users-b', UserViewSet)
router.register(r'payrolls', PayrollViewSet, basename='payrolls')
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'advance-payment-requests', AdvancePaymentRequestViewSet)

urlpatterns = router.urls + [
    path('register/', RegisterView.as_view(), name='register'),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', views.user_list, name="all-users"),
    path('users/<int:user_id>/', views.user_list, name='user-detail'),
    # path('users/', user_list.as_views(), name="all-users"),
    # path('users/<int:user_id>/', user_list.as_vires(), name='user-detail'),
    path('users/department/<int:department>/', views.user_list_by_department, name="all-users-by-department"),
    path("approve-user/<int:user_id>/", ApproveUserView.as_view(), name="approve-user"),
    path("assign-role/<int:user_id>/", AssignRoleView.as_view(), name="assign-role"),
    path("employee-profile/", EmployeeProfileView.as_view(), name="employee-profile"),
    path("create-task/", CreateTaskView.as_view(), name="create-task"),
    path("notifications/", ListNotificationsView.as_view(), name="list-notifications"),
    path("notifications/<int:notification_id>/read/", MarkNotificationReadView.as_view(), name="mark-notification-read"),
    path("send-message/", SendMessageView.as_view(), name="send-message"),
    path("messages/", ListMessagesView.as_view(), name="list-messages"),
    path("tasks/", ListEmployeeTasksView.as_view(), name="list-employee-tasks"),
    path("task-report/", TaskReportView.as_view(), name="task-report"),
    path("tasks/<int:task_id>/update-status/", UpdateTaskStatusView.as_view(), name="update-task-status"),
    # path("assign-task/", views.TaskAssignView, name="assign-task"),
    path('departments/', DepartmentListView.as_view(), name='departments'),
    path('departments/<int:id>/', DepartmentDetailView.as_view(), name='department-detail'),
    path("department-reports/", DepartmentReportView.as_view(), name="department-reports"),
    path('salaries/', SalaryListCreateView.as_view(), name='salary-list-create'),
    path('salaries/<int:pk>/', SalaryDetailView.as_view(), name='salary-detail'),
    path('employee/clockin/', ClockView.as_view(), name='clockin'),
    path('employee/clockout/', ClockView.as_view(), name='clockout'),
    path('User/attendance-summary/', AttendanceSummaryView.as_view(), name='attendance-summary'),
    path('api/leave-requests/<int:pk>/approve/', LeaveRequestViewSet.as_view({'post': 'approve'}), name='approve-leave-request'),
    path('api/advance-payment-requests/<int:pk>/approve/', AdvancePaymentRequestViewSet.as_view({'post': 'approve'}), name='approve-advance-payment-request'),
]

