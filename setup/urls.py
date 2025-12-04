from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from treinos import views as treino_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('treinos.urls')),
    
    path('cadastro/', treino_views.cadastro, name='cadastro'),

    path('login/', auth_views.LoginView.as_view(template_name='treinos/login.html'), name='login'),

    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    path('admin/', admin.site.urls),
    
    path('', include('django.contrib.auth.urls')),
]