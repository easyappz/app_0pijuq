from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    PostListView,
    PostCreateView,
    PostDetailView,
    PostDeleteView,
    CommentListView,
    CommentCreateView,
    CommentDeleteView,
    ProfileDetailView,
    ProfileUpdateView,
    ProfilePostsView
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("posts/", PostListView.as_view(), name="posts-list"),
    path("posts/", PostCreateView.as_view(), name="posts-create"),
    path("posts/<int:id>/", PostDetailView.as_view(), name="posts-detail"),
    path("posts/<int:id>/", PostDeleteView.as_view(), name="posts-delete"),
    path("posts/<int:post_id>/comments/", CommentListView.as_view(), name="comments-list"),
    path("posts/<int:post_id>/comments/", CommentCreateView.as_view(), name="comments-create"),
    path("comments/<int:id>/", CommentDeleteView.as_view(), name="comments-delete"),
    path("profile/<int:id>/", ProfileDetailView.as_view(), name="profile-detail"),
    path("profile/", ProfileUpdateView.as_view(), name="profile-update"),
    path("profile/<int:id>/posts/", ProfilePostsView.as_view(), name="profile-posts"),
]
