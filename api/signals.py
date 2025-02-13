from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import AdvancePaymentRequest, Notification

@receiver(post_save, sender=AdvancePaymentRequest)
def send_advance_request_notification(sender, instance, created, **kwargs):
    if created:
        message = "Your advance payment request has been submitted and is pending approval."
        Notification.objects.create(recipient=instance.employee, message=message)
    else:
        if instance.status == 'approved':
            message = "Your advance payment request has been approved!"
            Notification.objects.create(user=instance.employee, message=message)
        elif instance.status == 'rejected':
            message = "Your advance payment request has been rejected."
            Notification.objects.create(user=instance.employee, message=message)

@receiver(post_save, sender=Notification)
def send_notification_email(sender, instance, created, **kwargs):
    if created and instance.recipient:
        send_mail(
            subject="You've got a new notification!",
            message=instance.message,
            from_email="muhiaalpha@gmail.com",
            recipient_list=[instance.recipient.email],
            fail_silently=False,
        )