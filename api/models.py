from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    ]
    
    email = models.EmailField(max_length=90, unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="users")
    # role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, null=True)
    # department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    is_approved = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.is_approved = True
            self.role = None 
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class Employee(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="employees", null=True, blank=True)
    role = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return self.user.username

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Salary(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='salaries'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    pay_date = models.DateField(auto_now_add=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount}"

# class Task(models.Model):
#     title = models.CharField(max_length=255)
#     due_date = models.DateField()
#     description = models.TextField()
#     assigned_department = models.ForeignKey(
#         Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
#     )
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
#     status = models.CharField(
#         max_length=20,
#         choices=[("pending", "Pending"), ("in_progress", "In Progress"), ("completed", "Completed")],
#         default="pending",
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.title


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.username} - {self.start_date} to {self.end_date}"

class AdvancePaymentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.username} - ${self.amount}"  

class Payroll(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('direct_deposit', 'Direct Deposit'),
        ('check', 'Check'),
        ('electronic_transfer', 'Electronic Transfer'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payrolls")
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    payday = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True) 

    def __str__(self):
        return f"Payroll for {self.user.username}: {self.salary} via {self.payment_method}"

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    clock_in = models.DateTimeField()
    clock_out = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - Clock In: {self.clock_in}, Clock Out: {self.clock_out or 'In Progress'}"
