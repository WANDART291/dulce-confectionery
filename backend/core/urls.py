from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from business.views import payment_webhook

urlpatterns = [
    # 1. Django Admin (Manage users, products, payments)
    path("admin/", admin.site.urls),

    # 2. GraphQL API (The playground for your frontend)
    path("graphql/", csrf_exempt(GraphQLView.as_view(graphiql=True))),

    # 3. Payment Webhook (Where Chapa/Paystack sends confirmations)
    path("payment-webhook/", payment_webhook, name="payment-webhook"),
]