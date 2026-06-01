from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from business.views import payment_webhook

# --- NEW IMPORTS FOR MEDIA ---
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    
    path("admin/", admin.site.urls),

   
    path("graphql/", csrf_exempt(GraphQLView.as_view(graphiql=True))),

    path("payment-webhook/", payment_webhook, name="payment-webhook"),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)