from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Payment, Enrollment

@csrf_exempt
def payment_webhook(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        ref = data.get('tx_ref') # Chapa uses tx_ref
        
        payment = Payment.objects.get(reference=ref)
        if data.get('status') == 'success':
            payment.status = 'success'
            payment.save()
            
            # AUTOMATIC ENROLLMENT after successful payment
            Enrollment.objects.get_or_create(
                student=payment.user,
                course=payment.course
            )
            return HttpResponse(status=200)
    return HttpResponse(status=400)
