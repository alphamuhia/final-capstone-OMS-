from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Department, Task, Notification, Message, EmployeeProfile, Payroll, Salary, LeaveRequest, AdvancePaymentRequest, Role

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = ['id', 'full_name']

class DepartmentSerializer(serializers.ModelSerializer):
    employees = EmployeeSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'employees']

# class EmployeeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Employee
#         fields = ['id', 'name']

class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    department_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = EmployeeProfile
        fields = [
            'id',
            'user',
            'role',
            'status',
            'department',      
            'department_name', 
            'full_name',
            'id_number',
            'address',
            'profile_picture'
        ]
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

# class UserProfileSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username')
#     role = serializers.CharField(source='user.role', allow_null=True, required=False)
#     department = serializers.PrimaryKeyRelatedField(
#         source='user.department', 
#         queryset=Department.objects.all(), 
#         allow_null=True, 
#         required=False
#     )
#     email = serializers.EmailField(source='user.email', read_only=True)
    
#     class Meta:
#         model = UserProfile
#         fields = (
#             'username',
#             'email',
#             'full_name',
#             'id_number',
#             'address',
#             'profile_picture',
#             'role',
#             'department',
#         )
    
#     def update(self, instance, validated_data):
#         user_data = validated_data.pop('user', {})
#         user = instance.user
        
#         user.username = user_data.get('username', user.username)
#         user.role = user_data.get('role', user.role)
#         if 'department' in user_data:
#             user.department = user_data.get('department', user.department)
#         user.save()
        
#         instance.full_name = validated_data.get('full_name', instance.full_name)
#         instance.id_number = validated_data.get('id_number', instance.id_number)
#         instance.address = validated_data.get('address', instance.address)
#         if validated_data.get('profile_picture') is not None:
#             instance.profile_picture = validated_data.get('profile_picture')
#         instance.save()
        
#         return instance

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'role', 'department', 'is_approved']
#         read_only_fields = ['is_approved']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    # Option 1: Show role details (read-only nested serializer)
    role = RoleSerializer(read_only=True)
    # Optionally, if you need to set a role by its ID during writes:
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_id', 'department', 'is_approved']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'department']

    def create(self, validated_data):
        department = validated_data.pop('department', None)
        user = User.objects.create_user(**validated_data)
        if department:
            user.department = department
            user.save()
        return user

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.ReadOnlyField(source="assigned_to.username")
    created_by_username = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = Task
        # fields = ['id', 'title', 'description', 'assigned_to', 'assigned_to_username', 
        #           'created_by', 'created_by_username', 'status', 'created_at', 'updated_at']
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")
    receiver_username = serializers.ReadOnlyField(source="receiver.username")

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'sender_username', 'receiver_username', 'content', 'timestamp']

class SalarySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    payment_method = serializers.ChoiceField(choices=Salary.PAYMENT_METHOD_CHOICES)
    net_salary = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Salary
        fields = [
            'id',
            'user',
            'amount',
            'overtime_hours',
            'penalty',
            'tax',
            'net_salary',
            'payment_method',
            'pay_date',
            'created_at',
            'updated_at'
        ]
        
class PayrollSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Payroll
        fields = ['id', 'user', 'user_username', 'salary', 'payment_method', 'payday', 'notes']

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class AdvancePaymentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvancePaymentRequest
        fields = '__all__'
