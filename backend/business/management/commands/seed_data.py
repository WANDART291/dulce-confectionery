from django.core.management.base import BaseCommand
from business.models import Product, Course, User

class Command(BaseCommand):
    help = 'Seeds the database with cakes and courses'

    def handle(self, *args, **kwargs):
        # 1. Clear existing data
        Product.objects.all().delete()
        Course.objects.all().delete()

        # 2. Get or Create a default instructor (User)
        # We look for your admin user to be the instructor
        instructor = User.objects.filter(is_superuser=True).first()
        
        if not instructor:
            self.stdout.write(self.style.ERROR('No admin user found! Create a superuser first.'))
            return

        # 3. Add Cakes (Products)
        cakes = [
            {'name': 'Red Velvet Dream', 'price': 45.00, 'stock': 10},
            {'name': 'Triple Chocolate Blast', 'price': 55.00, 'stock': 5},
            {'name': 'Lemon Drizzle Supreme', 'price': 38.00, 'stock': 12},
            {'name': 'Vanilla Bean Classic', 'price': 35.00, 'stock': 15},
            {'name': 'Carrot Cake Delight', 'price': 42.00, 'stock': 8},
        ]

        for item in cakes:
            Product.objects.create(name=item['name'], price=item['price'], stock_quantity=item['stock'])

        # 4. Add Courses (Now with the instructor assigned!)
        courses = [
            {'title': 'Mastering Macarons', 'price': 150.00, 'max': 12},
            {'title': 'Wedding Cake Artistry', 'price': 300.00, 'max': 5},
            {'title': 'Beginners Bread Baking', 'price': 95.00, 'max': 20},
            {'title': 'Vegan Desserts 101', 'price': 120.00, 'max': 10},
        ]

        for item in courses:
            Course.objects.create(
                title=item['title'], 
                price=item['price'], 
                max_students=item['max'],
                instructor=instructor  # <--- THIS WAS THE MISSING LINK
            )

        self.stdout.write(self.style.SUCCESS('Successfully baked 5 cakes and assigned them to your admin!'))