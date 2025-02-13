from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import action
from django.db.models import Q
from .permissions import IsSenderOrRecipientOrPublic
from rest_framework.permissions import BasePermission, IsAuthenticated
from .models import (
    Department, 
    Task,  
    Message, 
    Role, 
    DailyLog, 
    EmployeeProfile, 
    User, 
    Payroll, 
    Salary, 
    LeaveRequest, 
    AdvancePaymentRequest,
    Notification,
    )
from .permissions import IsAdmin, IsManager, IsEmployee
from rest_framework import status, viewsets
from django.db.models import Count, Case, When
from django.utils import timezone
import datetime
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .serializers import (
    RegisterSerializer, 
    DepartmentSerializer, 
    TaskSerializer, 
    MessageSerializer,
    PayrollSerializer,
    SalarySerializer,
    LeaveRequestSerializer,
    AdvancePaymentRequestSerializer,
    EmployeeProfileSerializer,
    UserSerializer,
    RoleSerializer,
    DailyLogSerializer,
    NotificationSerializer,
    SendNotificationSerializer,
)

User = get_user_model()

# User Registration API
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@permission_classes([AllowAny])
class RoleViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides the standard actions for Role
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides the standard actions for User.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def user_list(request, user_id=None):
    
    if user_id is None:
        if request.method != "GET":
            return Response({"error": "Invalid request method for list view."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        # Using .values() here automatically returns the department id if it's a ForeignKey.
        users = User.objects.filter(is_superuser=False).values("id", "username", "department", "role", "is_approved")
        return Response(list(users))
    
    try:
        user = User.objects.get(id=user_id, is_superuser=False)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "GET":
        data = {
            "id": user.id,
            "username": user.username,
            "department": user.department.id if user.department else None,  # Fixed here
            "role": user.role,
            "is_approved": user.is_approved
        }
        return Response(data)
    
    elif request.method in ["PUT", "PATCH"]:
        data = request.data
        if "username" in data:
            user.username = data["username"]
        if "department" in data:
            # Here you might need to convert the department id from the request to a Department instance.
            user.department_id = data["department"] 
        if "role" in data:
            user.role = data["role"]
        if "is_approved" in data:
            user.is_approved = data["is_approved"]
        
        user.save()
        
        updated_data = {
            "id": user.id,
            "username": user.username,
            "department": user.department.id if user.department else None,  # Fixed here as well
            "role": user.role,
            "is_approved": user.is_approved
        }
        return Response(updated_data)
    
    elif request.method == "DELETE":
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_list_by_department(request, department):
    if request.method != "GET":
        return Response({"error": "Invalid request method"}, status=405)

    users = User.objects.filter(department=department, is_superuser=False).values("id", "username", "role")
    return Response(list(users))


# Loginview

class LoginView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        print(f"User: {request.user}, Authenticated: {request.user.is_authenticated}")
        """Check if the user is authenticated and return user details"""
        if request.user.is_authenticated:
            return Response({
                "username": request.user.username,
                "role": request.user.role,
                "is_superuser": request.user.is_superuser,
            })
        return Response({"error": "Not authenticated"}, status=401)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user:
            if not user.is_approved and not user.is_superuser:
                return Response({"error": "Account not approved by admin"}, status=403)

            refresh = RefreshToken.for_user(user)
            
            response_data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": user.role if hasattr(user, "role") else None,
                "is_superuser": user.is_superuser,
            }

            if user.is_superuser:
                response_data["redirect_to"] = "/admin"  

            return Response(response_data)
        
        return Response({"error": "Invalid credentials"}, status=401)

# Custom permission to allow only superusers
class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

# approve users API

class ApproveUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        """Retrieve user approval status."""
        try:
            user = User.objects.get(id=user_id)
            return Response({"user_id": user.id, "is_approved": user.is_approved})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    def post(self, request, user_id):
        """Approve a user."""
        try:
            user = User.objects.get(id=user_id)
            if user.is_approved:
                return Response({"message": "User is already approved"})
            user.is_approved = True
            user.save()
            return Response({"message": "User approved successfully"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


# Department List API
class DepartmentListView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]
    # lookup_field = 'name'

# User profile view API
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_superuser": user.is_superuser,
            "department": user.department.name if user.department else None
        })
    

class EmployeeProfileView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        try:
            employee = EmployeeProfile.objects.get(user=request.user)
        except EmployeeProfile.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

        approved_users = EmployeeProfile.objects.filter(status="approved")
        pending_users = EmployeeProfile.objects.filter(status="pending")

        approved_list = [{
            "username": user.user.username,
            "role": user.role,
            "department": user.department.name if user.department else None,
        } for user in approved_users]

        pending_list = [{
            "username": user.user.username,
            "role": user.role,
            "department": user.department.name if user.department else None,
        } for user in pending_users]

        data = {
            "profile": EmployeeProfileSerializer(employee).data,
            "approved_users": approved_list,
            "pending_users": pending_list,
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            employee = EmployeeProfile.objects.get(user=request.user)
        except EmployeeProfile.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeProfileSerializer(employee, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        try:
            employee = EmployeeProfile.objects.get(user=request.user)
        except EmployeeProfile.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeProfileSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        try:
            employee = EmployeeProfile.objects.get(user=request.user)
        except EmployeeProfile.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

        employee.delete()
        return Response({"detail": "Employee profile deleted."}, status=status.HTTP_204_NO_CONTENT)

# Assign roles API
class AssignRoleView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, user_id):
        try:
            employee = User.objects.get(id=user_id, department=request.user.department)
            new_role = request.data.get("role")

            if new_role not in ["assistant_manager", "team_leader", "employee"]:
                return Response({"error": "Invalid role"}, status=400)

            employee.role = new_role
            employee.save()
            return Response({"message": f"User role updated to {new_role}"})

        except User.DoesNotExist:
            return Response({"error": "User not found or not in your department"}, status=404)
    
# Employee task View API
class ListEmployeeTasksView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    


# @api_view(['POST'])
class DepartmentReportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        department_data = []

        for department in Department.objects.all():
            total_tasks = Task.objects.filter(assigned_to__department=department).count()
            completed_tasks = Task.objects.filter(assigned_to__department=department, status="completed").count()
            pending_tasks = Task.objects.filter(assigned_to__department=department, status="pending").count()
            in_progress_tasks = Task.objects.filter(assigned_to__department=department, status="in_progress").count()

            department_data.append({
                "department": department.name,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "pending_tasks": pending_tasks,
                "in_progress_tasks": in_progress_tasks,
            })

        return Response(department_data)
    
    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Payroll API
class PayrollViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    
    def create(self, request, *args, **kwargs):
        # Only allow admin to create payroll records.
        if request.user.role != "admin":
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

# List all salary records or create a new one
@permission_classes([AllowAny])
class SalaryListCreateView(generics.ListCreateAPIView):
    queryset = Salary.objects.all()
    serializer_class = SalarySerializer

@permission_classes([AllowAny])
class SalaryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Salary.objects.all()
    serializer_class = SalarySerializer

# class DailyLogCreateAPIView(generics.CreateAPIView):
#     queryset = DailyLog.objects.all()
#     serializer_class = DailyLogSerializer
#     permission_classes = [permissions.AllowAny]

class DailyLogListCreateAPIView(generics.ListCreateAPIView):
    """
    API view to list all DailyLog entries (GET) and create a new DailyLog entry (POST).
    """
    queryset = DailyLog.objects.all()
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class TaskReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["admin", "manager"]:
            return Response({"error": "Only admins and managers can view reports."}, status=403)

        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status="completed").count()
        pending_tasks = Task.objects.filter(status="pending").count()
        in_progress_tasks = Task.objects.filter(status="in_progress").count()

        employees_performance = Task.objects.values("assigned_to__username").annotate(
            completed_count=Count(Case(When(status="completed", then=1))),
            total_count=Count("id")
        )

        return Response({
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "employee_performance": list(employees_performance)
        })

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        receiver_id = request.data.get("receiver")
        content = request.data.get("content")

        try:
            receiver = User.objects.get(id=receiver_id)
            message = Message.objects.create(sender=sender, receiver=receiver, content=content)
            return Response({"message": "Message sent successfully"}, status=201)
        except User.DoesNotExist:
            return Response({"error": "Receiver not found"}, status=404)

class ListMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(receiver=request.user).order_by("-timestamp")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

class NotificationListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Return notifications where:
        # - the user is the sender, OR
        # - the user is the recipient, OR
        # - the notification is broadcast (recipient is None)
        return Notification.objects.filter(
            Q(sender=user) | Q(recipient=user) | Q(recipient__isnull=True)
        )
    
    def perform_create(self, serializer):
        # Automatically set the sender to the logged in user.
        serializer.save(sender=self.request.user)

# class NotificationListCreateAPIView(generics.ListCreateAPIView):
#     serializer_class = NotificationSerializer
#     permission_classes = [AllowAny]  
#     authentication_classes = []

#     def get_queryset(self):
#         try:
#             queryset = Notification.objects.all().order_by('-is_pinned', '-created_at')
#             print(f"Fetched {queryset.count()} notifications")
#             return queryset
#         except Exception as e:
#             print(f"Error fetching notifications: {str(e)}")  
#             return Notification.objects.none()

class NotificationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsSenderOrRecipientOrPublic]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Notification.objects.filter(
                Q(sender=user) | Q(recipient=user) | Q(recipient__isnull=True)
            )
        return Notification.objects.filter(recipient__isnull=True)


# class NotificationRetrieveUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = NotificationSerializer
#     queryset = Notification.objects.all()
#     permission_classes = [AllowAny]
#     authentication_classes = []


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

class AdvancePaymentRequestViewSet(viewsets.ModelViewSet):
    queryset = AdvancePaymentRequest.objects.all()
    serializer_class = AdvancePaymentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

# class AdvancePaymentRequestViewSet(viewsets.ModelViewSet):
#     queryset = AdvancePaymentRequest.objects.all()
#     serializer_class = AdvancePaymentRequestSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(employee=self.request.user)
