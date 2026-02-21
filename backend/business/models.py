from django.contrib.auth.models import AbstractUser
from django.db import models

# 1. User Model
class User(AbstractUser):
    # Nexus HR style roles
    IS_STUDENT = 'student'
    IS_TEACHER = 'teacher'
    IS_CUSTOMER = 'customer'
    
    ROLE_CHOICES = [
        (IS_STUDENT, 'Student'),
        (IS_TEACHER, 'Teacher'),
        (IS_CUSTOMER, 'Customer'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=IS_CUSTOMER)

# 2. Product Model (For the Patisserie/Shop)
class Product(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# 3. Course Model (The Academy Blueprint)
# This uses the new fields needed for your School frontend (Dates, Levels, Images)
class Course(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    date_time = models.DateTimeField(help_text="When is the class?")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(default="https://images.unsplash.com/photo-1556910103-1c02745a30bf")
    seats_available = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.title} ({self.level})"

# 4. Enrollment Model (Links Students to Courses)
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

# 5. Payment Model (Tracks Sales)
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    reference = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='pending') # pending, success, failed
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.status})"

        # --- Add this to backend/business/models.py ---

class Order(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    items_summary = models.TextField() # We will store the list of cakes as a text block
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"
