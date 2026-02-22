import os
import graphene
import stripe
from graphene_django import DjangoObjectType
from .models import Product, Course, Order
from django.core.mail import send_mail
from django.template.loader import render_to_string 
from django.utils.html import strip_tags 

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

class ProductType(DjangoObjectType):
    class Meta:
        model = Product

class CourseType(DjangoObjectType):
    class Meta:
        model = Course

class OrderType(DjangoObjectType):
    class Meta:
        model = Order

class CreateOrder(graphene.Mutation):
    class Arguments:
        full_name = graphene.String(required=True)
        email = graphene.String(required=True)
        total_amount = graphene.Decimal(required=True)
        items_summary = graphene.String(required=True)
        payment_method_id = graphene.String(required=True) 
        product_ids = graphene.List(graphene.ID)
        course_ids = graphene.List(graphene.ID)

    order = graphene.Field(OrderType)
    ok = graphene.Boolean()
    error_message = graphene.String()

    def mutate(self, info, full_name, email, total_amount, items_summary, payment_method_id, product_ids=None, course_ids=None):
        if product_ids:
            for pid in product_ids:
                product = Product.objects.get(pk=pid)
                if product.stock_quantity <= 0:
                    return CreateOrder(ok=False, error_message=f"Sorry, '{product.name}' is out of stock!")

        if course_ids:
            for cid in course_ids:
                course = Course.objects.get(pk=cid)
                if course.seats_available <= 0:
                    return CreateOrder(ok=False, error_message=f"Sorry, '{course.title}' is fully booked!")

        try:
            amount_in_cents = int(float(total_amount) * 100)
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='zar',
                payment_method=payment_method_id,
                confirm=True,
                automatic_payment_methods={"enabled": True, "allow_redirects": "never"}
            )
        except stripe.error.CardError as e:
            return CreateOrder(ok=False, error_message=f"Payment declined: {e.user_message}")
        except Exception as e:
            print(f"❌ EXACT PAYMENT ERROR: {str(e)}")
            return CreateOrder(ok=False, error_message="Payment processing failed. Please try again.")

        if product_ids:
            for pid in product_ids:
                product = Product.objects.get(pk=pid)
                product.stock_quantity -= 1
                product.save()

        if course_ids:
            for cid in course_ids:
                course = Course.objects.get(pk=cid)
                course.seats_available -= 1
                course.save()

        order = Order(
            full_name=full_name,
            email=email,
            total_amount=total_amount,
            items_summary=items_summary
        )
        order.save()

        # --- SMART EMAIL LOGIC ---
        is_course = bool(course_ids) 
        
        # 1. PREPARE THE CUSTOMER RECEIPT
        customer_subject = f"{'Class Registration' if is_course else 'Order Confirmation'} - Dulce Zone #{order.id}"
        html_message = render_to_string('receipt.html', {
            'full_name': full_name,
            'order_id': order.id,
            'total_amount': total_amount,
            'items_summary': items_summary,
            'is_course': is_course 
        })
        plain_message = strip_tags(html_message)
        
        # 2. PREPARE THE OWNER NOTIFICATION
        owner_subject = f"🎉 NEW {'BOOKING' if is_course else 'ORDER'}: #{order.id} from {full_name}"
        owner_message = (
            f"Great news! You just received a new {'booking' if is_course else 'order'}.\n\n"
            f"CUSTOMER DETAILS:\n"
            f"- Name: {full_name}\n"
            f"- Email: {email}\n"
            f"- Total Paid: R {total_amount}\n\n"
            f"ITEMS:\n{items_summary}\n\n"
            f"Log into your Django Admin panel to view the full details."
        )

        try:
            # SEND EMAIL 1: To the Customer (HTML Receipt)
            send_mail(
                customer_subject,
                plain_message,
                'wandilekhanyile63@gmail.com', 
                [email], # Sent to the customer's email
                html_message=html_message,
                fail_silently=False
            )
            
            # SEND EMAIL 2: To the Owner (Plain Text Alert)
            send_mail(
                owner_subject,
                owner_message,
                'wandilekhanyile63@gmail.com', # Sent from the app
                ['wandilekhanyile63@gmail.com'], # Sent directly to the owner!
                fail_silently=False
            )
            print("BOTH EMAILS SENT SUCCESSFULLY!")
        except Exception as e:
            print(f"Email error: {e}")
        
        return CreateOrder(order=order, ok=True, error_message="")

class Query(graphene.ObjectType):
    all_products = graphene.List(ProductType)
    all_courses = graphene.List(CourseType)

    def resolve_all_products(self, info):
        return Product.objects.all()

    def resolve_all_courses(self, info):
        return Course.objects.all()

class Mutation(graphene.ObjectType):
    create_order = CreateOrder.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)