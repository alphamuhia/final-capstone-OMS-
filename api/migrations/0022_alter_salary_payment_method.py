# Generated by Django 5.1.5 on 2025-02-12 08:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_salary_overtime_hours_salary_payment_method_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salary',
            name='payment_method',
            field=models.CharField(choices=[('m-pesa', 'M-Pesa'), ('check', 'Check'), ('cash', 'Cash'), ('bank', 'Bank')], max_length=50),
        ),
    ]
