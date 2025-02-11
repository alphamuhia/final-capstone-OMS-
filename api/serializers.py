from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Department, Task, Notification, Message, Employee, Payroll, Salary, LeaveRequest, AdvancePaymentRequest

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name']

class DepartmentSerializer(serializers.ModelSerializer):
    employees = EmployeeSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'employees']

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department', 'is_approved']
        read_only_fields = ['is_approved']

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
    class Meta:
        model = Salary
        fields = ['id', 'user', 'amount', 'pay_date', 'created_at', 'updated_at']

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
