from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta, date
from .models import (
    Department, 
    Task, 
    Message, 
    EmployeeProfile, 
    DailyLog, 
    Payroll, 
    Salary, 
    LeaveRequest, 
    Notification,
    AdvancePaymentRequest, 
    Role
)

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


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
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
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.ReadOnlyField(source='sender.username')  
    recipient = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'recipient', 'message', 'is_read', 'is_pinned', 'created_at']
        read_only_fields = ['created_at']

        def get_recipient(self, obj):
            # If the notification has a recipient, return their username.
            # Otherwise, assume it's a broadcast notification and return "Everyone".
            if obj.recipient:
                return obj.recipient.username
            return "Everyone"
    
class SendNotificationSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user'
    )

    class Meta:
        model = Notification
        fields = ['recipient', 'message']

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
        read_only_fields = ('employee', 'status', 'created_at')

class AdvancePaymentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvancePaymentRequest
        fields = ('amount', 'reason')
    
    def create(self, validated_data):
        validated_data.pop('reason', None)
        return AdvancePaymentRequest.objects.create(**validated_data)


# class AdvancePaymentRequestSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AdvancePaymentRequest
#         fields = '__all__'
#         read_only_fields = ('employee', 'created_at')

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = ['id', 'user', 'time_in', 'time_out', 'hours_worked', 'date', 'created_at']
        read_only_fields = ['id', 'user', 'hours_worked', 'date', 'created_at']

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        time_in = validated_data.get("time_in")
        time_out = validated_data.get("time_out")

        today_date = date.today()

        if DailyLog.objects.filter(user=user, date=today_date).exists():
            raise serializers.ValidationError("Daily log for today already exists.")

        dt_in = datetime.combine(today_date, time_in)
        dt_out = datetime.combine(today_date, time_out)

        if dt_out < dt_in:
            dt_out += timedelta(days=1)

        hours_worked = round((dt_out - dt_in).total_seconds() / 3600, 2)

        validated_data["hours_worked"] = hours_worked
        validated_data["user"] = user
        validated_data["date"] = today_date  

        return DailyLog.objects.create(**validated_data)
