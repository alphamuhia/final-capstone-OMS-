from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from .models import Department, Task, Notification, Message, Role, EmployeeProfile, User, Payroll, Salary, Attendance, LeaveRequest, AdvancePaymentRequest
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
    NotificationSerializer,
    PayrollSerializer,
    SalarySerializer,
    LeaveRequestSerializer,
    AdvancePaymentRequestSerializer,
    EmployeeProfileSerializer,
    UserSerializer,
    RoleSerializer
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

# Users

# @api_view(['GET'])
# @permission_classes([AllowAny]) 
# def user_list(request, user_id=None): 
    
#     if request.method != "GET":
#         return Response({"error": "Invalid request method"}, status=405)

#     if user_id:  
#         try:
#             user = User.objects.get(id=user_id, is_superuser=False)
#             return Response({"id": user.id, "username": user.username, "is_approved": user.is_approved})
#         except User.DoesNotExist:
#             return Response({"error": "User not found"}, status=404)
    
#     users = User.objects.filter(is_superuser=False).values("id", "username", "department","role", "is_approved")
#     return Response(list(users))

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


# @api_view(['GET', 'POST'])
# @permission_classes([AllowAny])
# def user_list(request):
#     """
#     GET: List all non-superuser users.
#     POST: Create a new user.
#     """
#     if request.method == 'GET':
#         users = User.objects.filter(is_superuser=False).values(
#             "id", "username", "department", "role", "is_approved"
#         )
#         return Response(list(users))
    
#     elif request.method == 'POST':
#         data = request.data
#         try:
#             user = User.objects.create(
#                 username=data.get("username"),
#                 department=data.get("department"), 
#                 role=data.get("role"),
#                 is_approved=data.get("is_approved", False)
#             )
#             response_data = {
#                 "id": user.id,
#                 "username": user.username,
#                 "department": user.department,
#                 "role": user.role,
#                 "is_approved": user.is_approved,
#             }
#             return Response(response_data, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
# @permission_classes([AllowAny])
# def user_detail(request, user_id):
#     """
#     GET: Retrieve a specific user’s details.
#     PUT/PATCH: Update a specific user’s details.
#     DELETE: Delete a specific user.
#     """
#     try:
#         user = User.objects.get(id=user_id, is_superuser=False)
#     except User.DoesNotExist:
#         return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
#     if request.method == 'GET':
#         data = {
#             "id": user.id,
#             "username": user.username,
#             "department": user.department,
#             "role": user.role,
#             "is_approved": user.is_approved,
#         }
#         return Response(data)
    
#     elif request.method in ["PUT", "PATCH"]:
#         data = request.data
#         if "username" in data:
#             user.username = data["username"]
#         if "department" in data:
#             user.department = data["department"]
#         if "role" in data:
#             user.role = data["role"]
#         if "is_approved" in data:
#             user.is_approved = data["is_approved"]
        
#         user.save()
        
#         updated_data = {
#             "id": user.id,
#             "username": user.username,
#             "department": user.department,
#             "role": user.role,
#             "is_approved": user.is_approved,
#         }
#         return Response(updated_data)
    
#     elif request.method == 'DELETE':
#         user.delete()
#         return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_list_by_department(request, department):
    if request.method != "GET":
        return Response({"error": "Invalid request method"}, status=405)

    users = User.objects.filter(department=department, is_superuser=False).values("id", "username", "role")
    return Response(list(users))


# Loginview

class LoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
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


# EmployeeProfile view API
# class EmployeeProfileView(APIView):
#     permission_classes = [IsAuthenticated, IsEmployee] 

#     def get(self, request):

#         user_profile = Employee.objects.get(user=request.user)

#         approved_users = Employee.objects.filter(status='approved')
#         pending_users = Employee.objects.filter(status='pending')

#         approved_list = [{"username": user.user.username, "role": user.role, "department": user.department.name if user.department else None} for user in approved_users]
#         pending_list = [{"username": user.user.username, "role": user.role, "department": user.department.name if user.department else None} for user in pending_users]

#         return Response({
#             "username": request.user.username,
#             "role": request.user.role,
#             "department": request.user.department.name if request.user.department else None
#         })


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
    lookup_field = 'name'

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
    permission_classes = [IsAuthenticated]  # Add custom IsEmployee if applicable

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

# Create task view API

class CreateTaskView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        title = request.data.get("title")
        description = request.data.get("description")
        assigned_to_id = request.data.get("assigned_to")
        due_date = request.data.get("due_date")

        print(f"Assigned to ID received: {assigned_to_id}")  

        if not assigned_to_id:
            return Response({"error": "Assigned user ID is required"}, status=400)

        assigned_to = get_object_or_404(User, id=assigned_to_id)

        if not request.user or request.user.is_anonymous:
            return Response({"error": "Authentication required"}, status=401)

        task = Task.objects.create(
            title=title,
            description=description,
            assigned_to=assigned_to,
            created_by=request.user,
            due_date=due_date,
        )

        send_notification(assigned_to, f"You have been assigned a new task: {task.title}")

        serializer = TaskSerializer(task)
        return Response(serializer.data, status=201)

class CreateTaskView(APIView):
    permission_classes = [AllowAny]

    # def post(self, request):
    #     title = request.data.get("title")
    #     description = request.data.get("description")
    #     assigned_to_id = request.data.get("assigned_to")
    #     due_date = request.data.get("due_date")

    #     assigned_to = User.objects.get(id=assigned_to_id)

    #     task = Task.objects.create(
    #         title=title,
    #         description=description,
    #         assigned_to=assigned_to,
    #         created_by=request.user,
    #         due_date=due_date,
    #     )

    #     # Send notification to employee
    #     send_notification(assigned_to, f"You have been assigned a new task: {task.title}")

    #     serializer = TaskSerializer(task)
    #     return Response(serializer.data, status=201)
    
# Employee task View API
class ListEmployeeTasksView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
# Update task
class UpdateTaskStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id, assigned_to=request.user)
            new_status = request.data.get("status", task.status)
            task.status = new_status
            task.save()

            # Notify manager about task status update
            Notification.objects.create(
                recipient=task.created_by,
                message=f"{request.user.username} updated task '{task.title}' to {new_status}."
            )

            return Response(TaskSerializer(task).data)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
     
@api_view(['POST'])
class TaskAssignView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.role == "admin":
            assigned_to_id = request.data.get("assigned_to")
            title = request.data.get("title")
            description = request.data.get("description")

            if not title or not description or not assigned_to_id:
                return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                assigned_to = User.objects.get(id=assigned_to_id, role="manager")
                task = Task.objects.create(
                    title=title,
                    description=description,
                    assigned_to=assigned_to,
                    created_by=request.user
                )

                Notification.objects.create(
                    recipient=assigned_to,
                    message=f"You have been assigned a new task: {task.title}"
                )

                return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

            except User.DoesNotExist:
                return Response({"error": "Manager not found"}, status=status.HTTP_404_NOT_FOUND)

        elif request.user.role == "manager":
            assigned_to_id = request.data.get("assigned_to")
            title = request.data.get("title")
            description = request.data.get("description")

            if not title or not description or not assigned_to_id:
                return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                assigned_to = User.objects.get(id=assigned_to_id, role="employee")
                task = Task.objects.create(
                    title=title,
                    description=description,
                    assigned_to=assigned_to,
                    created_by=request.user
                )

                Notification.objects.create(
                    recipient=assigned_to,
                    message=f"You have been assigned a new task: {task.title}"
                )

                return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

            except User.DoesNotExist:
                return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"error": "You do not have permission to assign tasks."}, status=status.HTTP_403_FORBIDDEN)

def send_notification(user, message):
    Notification.objects.create(user=user, message=message)

class ListNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)

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

class ClockView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        action = request.data.get('action')
        if action not in ['in', 'out']:
            return Response(
                {"detail": "Invalid action. Provide 'in' to clock in or 'out' to clock out."},
                status=status.HTTP_400_BAD_REQUEST
            )

        time_input = request.data.get("time")
        if time_input:
            try:
                parsed_time = timezone.datetime.strptime(time_input, "%H:%M")
                now = timezone.now()
                parsed_time = parsed_time.replace(year=now.year, month=now.month, day=now.day)
                parsed_time = timezone.make_aware(parsed_time)
            except ValueError:
                return Response(
                    {"detail": "Invalid time format. Please use HH:MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            parsed_time = timezone.now()

        if action == 'in':
            if Attendance.objects.filter(user=request.user, clock_out__isnull=True).exists():
                return Response(
                    {"detail": "Already clocked in."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            attendance = Attendance.objects.create(
                user=request.user,
                clock_in=parsed_time
            )
            return Response(
                {"detail": "Clocked in successfully.", "clock_in": attendance.clock_in},
                status=status.HTTP_201_CREATED
            )

        if action == 'out':
            try:
                attendance = Attendance.objects.get(user=request.user, clock_out__isnull=True)
            except Attendance.DoesNotExist:
                return Response(
                    {"detail": "No active clock in record found."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            attendance.clock_out = parsed_time
            attendance.save()
            return Response(
                {
                    "detail": "Clocked out successfully.",
                    "clock_in": attendance.clock_in,
                    "clock_out": attendance.clock_out,
                },
                status=status.HTTP_200_OK
            )

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

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user, is_read=False)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)

class AttendanceSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        start_date = today - datetime.timedelta(days=29)
        summary = []

        attendances = Attendance.objects.filter(
            user=user,
            clock_in__date__gte=start_date,
            clock_in__date__lte=today
        ).order_by("clock_in")

        attended_dates = {attendance.clock_in.date() for attendance in attendances}

        for i in range(30):
            day = start_date + datetime.timedelta(days=i)
            status_str = "Present" if day in attended_dates else "Absent"
            summary.append({
                "date": day.isoformat(),
                "status": status_str,
            })

        return Response(summary, status=status.HTTP_200_OK)

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
