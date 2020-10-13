from django.contrib import admin

# Register your models here.
from mail.models import *
admin.site.register(Email)
