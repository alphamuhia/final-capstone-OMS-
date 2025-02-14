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
    NotificationRetrieveUpdateDestroyAPIView,
    EmployeeProfileView,
    DepartmentReportView,
    ListEmployeeTasksView,
    SendMessageView,
    ListMessagesView,
    DepartmentDetailView,
    TaskReportView,
    SalaryListCreateView,
    SalaryDetailView,
    DailyLogListCreateAPIView,
    LeaveRequestViewSet,
    AdvancePaymentRequestListCreateAPIView,
    UserViewSet,
    NotificationListCreateAPIView,
    RoleViewSet,
    CustomTokenObtainPairView,
    CreatePaymentIntent,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'users-b', UserViewSet)
router.register(r'payrolls', PayrollViewSet, basename='payrolls')
router.register(r'leave-requests', LeaveRequestViewSet)


urlpatterns = router.urls + [
    path('register/', RegisterView.as_view(), name='register'),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path('login/', LoginView.as_view(), name='login'),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('users/', views.user_list, name="all-users"),
    path('users/<int:user_id>/', views.user_list, name='user-detail'),
    path('users/department/<int:department>/', views.user_list_by_department, name="all-users-by-department"),
    path("approve-user/<int:user_id>/", ApproveUserView.as_view(), name="approve-user"),
    path("assign-role/<int:user_id>/", AssignRoleView.as_view(), name="assign-role"),
    path("employee-profile/", EmployeeProfileView.as_view(), name="employee-profile"),
    path("send-message/", SendMessageView.as_view(), name="send-message"),
    path("messages/", ListMessagesView.as_view(), name="list-messages"),
    path("tasks/", ListEmployeeTasksView.as_view(), name="list-employee-tasks"),
    path("task-report/", TaskReportView.as_view(), name="task-report"),
    path('departments/', DepartmentListView.as_view(), name='departments'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
    path("department-reports/", DepartmentReportView.as_view(), name="department-reports"),
    path('salaries/', SalaryListCreateView.as_view(), name='salary-list'),
    path('salaries/<int:pk>/', SalaryDetailView.as_view(), name='salary-detail'),
    path('leave-requests/<int:pk>/approve/', LeaveRequestViewSet.as_view({'post': 'approve'}), name='approve-leave-request'),
    path('advance-payment-requests/', AdvancePaymentRequestListCreateAPIView.as_view(), name='advance-payment-request'),
    path('daily-log/', DailyLogListCreateAPIView.as_view(), name='daily-log-create'),
    path('notifications/', NotificationListCreateAPIView.as_view(), name='notification-list-create'),
    path('notifications/<int:pk>/', NotificationRetrieveUpdateDestroyAPIView.as_view(), name='notification-retrieve-update'),

    path('createpayment/', CreatePaymentIntent.as_view(), name='create-payment-intent'),
    # path('create-payment/', CreatePaymentIntent.as_view(), name='create-payment-intent'),

    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]


