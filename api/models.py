from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db import models
from decimal import Decimal

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

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
    is_approved = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.is_approved = True
            self.role = None 
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
    
class EmployeeProfile(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='employee_profile'
    )
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        related_name="employees", 
        null=True, 
        blank=True
    )
    role = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    id_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        blank=True, 
        null=True
    )

    def __str__(self):
        return self.user.username

# class Employee(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#     ]
    
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     # department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
#     department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="employees", null=True, blank=True)
#     role = models.CharField(max_length=50)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

#     def __str__(self):
#         return self.user.username

# class UserProfile(models.Model):
#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL, 
#         on_delete=models.CASCADE, 
#         related_name='profile'
#     )
#     full_name = models.CharField(max_length=255, blank=True, null=True)
#     id_number = models.CharField(max_length=50, blank=True, null=True)
#     address = models.TextField(blank=True, null=True)
#     profile_picture = models.ImageField(
#         upload_to='profile_pictures/', 
#         blank=True, 
#         null=True
#     )

#     def __str__(self):
#         return f"{self.user.username}'s profile"

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
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    penalty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    PAYMENT_METHOD_CHOICES = [
        ('check', 'Check'),
        ('cash', 'Cash'),
        ('bank', 'Bank'),
    ]
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES 
    )
    
    pay_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_tax(self):
        """
        Calculates tax based on:
          - Overtime bonus is $50 per hour.
          - Taxable amount = base salary + overtime bonus - penalty.
          - Tax rate = 10%.
        """
        overtime_bonus = self.overtime_hours * Decimal('50.00')
        taxable_amount = self.amount + overtime_bonus - self.penalty
        return taxable_amount * Decimal('0.1')

    @property
    def net_salary(self):
        """
        Returns the net salary after adjustments.
        
        Calculation:
          overtime_bonus = overtime_hours * $50.00
          taxable_amount = base salary + overtime bonus - penalty
          tax = taxable_amount * 0.1
          net_salary = taxable_amount - tax
                     = (base salary + overtime bonus - penalty) * 0.9
        """
        overtime_bonus = self.overtime_hours * Decimal('50.00')
        taxable_amount = self.amount + overtime_bonus - self.penalty
        tax_value = taxable_amount * Decimal('0.1')
        return taxable_amount - tax_value

    def save(self, *args, **kwargs):
        self.tax = self.calculate_tax()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.amount}"

## new notification model
class Notification(models.Model):
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True
    )
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='received_notifications', null=True, blank=True
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        rec = self.recipient.username if self.recipient else "Everyone"
        return f"From {self.sender} to {rec}: {self.message}"

### {/* this is the original notification model */}
# class Notification(models.Model):
#     sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
#     recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications', null=True, blank=True)
#     message = models.TextField()
#     is_read = models.BooleanField(default=False)
#     is_pinned = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"From {self.sender} to {self.recipient}: {self.message}"

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
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='advance_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user} - {self.amount} - {self.status}"
    
    def __str__(self):
        return f"{self.user} - {self.amount} - {self.status}" 

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

# class Attendance(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
#     clock_in = models.DateTimeField()
#     clock_out = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.user.username} - Clock In: {self.clock_in}, Clock Out: {self.clock_out or 'In Progress'}"


class DailyLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_logs"
    )
    time_in = models.TimeField()
    time_out = models.TimeField()
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField(auto_now_add=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.date}"

