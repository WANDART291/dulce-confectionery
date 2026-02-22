import dj_database_url
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'fallback-key-if-missing')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Allow all hosts so Docker containers can talk to each other
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'graphene_django',
    'corsheaders',

    # Local apps
    'business',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

GRAPHENE = {
    "SCHEMA": "business.schema.schema"
}

# THE SECURITY FIX: This forces Django to actually look at your VIP list below
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# THE VIP GUEST LIST - VERCEL IS NOW EXPLICITLY ALLOWED IN
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://dulce-zone.vercel.app",
]

# PREVENTS GRAPHQL MUTATIONS (LIKE CHECKOUT) FROM BEING BLOCKED
CSRF_TRUSTED_ORIGINS = [
    "https://dulce-zone.vercel.app",
    "https://dulce-backend-api.onrender.com",
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'business' / 'templates'], # Added templates directory discovery
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# THE DATABASE FIX: Pointing the fallback directly to your local PostgreSQL database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'postgresql://postgres:password123@localhost:5432/confectionery_db')
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'business.User'

# --- EMAIL CONFIGURATION (LIVE) ---
# Now using SMTP to send real emails to your inbox!
# --- EMAIL CONFIGURATION ---
# Temporarily printing emails to the console to bypass the Render timeout crash
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'

# Swap to Port 465 and SSL to bypass the cloud firewall
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_USE_TLS = False 

EMAIL_HOST_USER = 'wandilekhanyile63@gmail.com' 
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')

# Give Google exactly 10 seconds to respond before saving the server from a crash
EMAIL_TIMEOUT = 10