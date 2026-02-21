from django.contrib import admin
from .models import User, Product, Course, Enrollment, Payment, Order # <-- ADDED 'Order' HERE

# 1. User Admin
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')

# 2. Product Admin (Shop)
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock_quantity')
    search_fields = ('name',)

# 3. Course Admin (Academy)
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # FIXED: We removed 'instructor' and 'max_students'
    # We added 'level', 'date_time', and 'seats_available'
    list_display = ('title', 'level', 'date_time', 'price', 'seats_available')
    list_filter = ('level', 'date_time')
    search_fields = ('title',)

# 4. Enrollment Admin
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')

# 5. Payment Admin
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'amount', 'status', 'reference')
    list_filter = ('status',)

# 6. Order Admin (Checkout) <-- NEW SECTION ADDED
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'total_amount', 'created_at')
    search_fields = ('full_name', 'email')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)