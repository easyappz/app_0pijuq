from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .serializers import (
    MessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer
)
from .models import Member, Post, Comment
from .authentication import CookieAuthentication, create_session, delete_session


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    Register a new user and create a session
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: MemberSerializer,
            400: {'description': 'Validation errors'}
        },
        description="Register a new user account"
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member = serializer.save()
        
        # Create session
        session_token = create_session(member)
        
        # Prepare response
        member_serializer = MemberSerializer(member)
        response = Response(member_serializer.data, status=status.HTTP_201_CREATED)
        
        # Set HttpOnly cookie
        response.set_cookie(
            key='sessionid',
            value=session_token,
            httponly=True,
            samesite='Lax',
            max_age=30*24*60*60,  # 30 days
            path='/'
        )
        
        return response


class LoginView(APIView):
    """
    Login user and create a session
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: MemberSerializer,
            401: {'description': 'Invalid credentials'}
        },
        description="Authenticate user and set session cookie"
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            return Response(
                {
                    "error": "Invalid credentials",
                    "details": {}
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not member.check_password(password):
            return Response(
                {
                    "error": "Invalid credentials",
                    "details": {}
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Create session
        session_token = create_session(member)
        
        # Prepare response
        member_serializer = MemberSerializer(member)
        response = Response(member_serializer.data, status=status.HTTP_200_OK)
        
        # Set HttpOnly cookie
        response.set_cookie(
            key='sessionid',
            value=session_token,
            httponly=True,
            samesite='Lax',
            max_age=30*24*60*60,  # 30 days
            path='/'
        )
        
        return response


class LogoutView(APIView):
    """
    Logout user and clear session
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: {'description': 'Successfully logged out'},
            401: {'description': 'Not authenticated'}
        },
        description="Logout current user and clear session cookie"
    )
    def post(self, request):
        session_token = request.COOKIES.get('sessionid')
        
        # Delete session from cache
        delete_session(session_token)
        
        response = Response(
            {"message": "Successfully logged out"},
            status=status.HTTP_200_OK
        )
        
        # Clear cookie
        response.delete_cookie('sessionid', path='/')
        
        return response


class MeView(APIView):
    """
    Get current authenticated user
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: MemberSerializer,
            401: {'description': 'Not authenticated'}
        },
        description="Get information about currently authenticated user"
    )
    def get(self, request):
        member_serializer = MemberSerializer(request.user)
        return Response(member_serializer.data, status=status.HTTP_200_OK)


class PostsPagination(PageNumberPagination):
    """
    Custom pagination for posts list
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostListCreateView(APIView):
    """
    Get paginated list of posts or create a new post
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: PostSerializer(many=True),
            401: {'description': 'Unauthorized'}
        },
        description="Get paginated list of posts"
    )
    def get(self, request):
        posts = Post.objects.all()
        
        # Apply pagination
        paginator = PostsPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        
        serializer = PostSerializer(paginated_posts, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        request=PostCreateSerializer,
        responses={
            201: PostSerializer,
            400: {'description': 'Validation errors'},
            401: {'description': 'Unauthorized'}
        },
        description="Create a new post"
    )
    def post(self, request):
        serializer = PostCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create post with current user as author
        post = serializer.save(author=request.user)
        
        # Return full post data
        response_serializer = PostSerializer(post)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PostDetailDeleteView(APIView):
    """
    Get details of a specific post or delete it
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: PostSerializer,
            401: {'description': 'Unauthorized'},
            404: {'description': 'Post not found'}
        },
        description="Get details of a specific post"
    )
    def get(self, request, id):
        post = get_object_or_404(Post, id=id)
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        responses={
            204: {'description': 'Post deleted successfully'},
            401: {'description': 'Unauthorized'},
            403: {'description': 'Forbidden - not the owner'},
            404: {'description': 'Post not found'}
        },
        description="Delete user's own post"
    )
    def delete(self, request, id):
        post = get_object_or_404(Post, id=id)
        
        # Check if user is the author
        if post.author.id != request.user.id:
            return Response(
                {
                    "error": "You do not have permission to delete this post",
                    "details": {}
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentListCreateView(APIView):
    """
    Get list of comments for a specific post or create a new comment
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: CommentSerializer(many=True),
            401: {'description': 'Unauthorized'},
            404: {'description': 'Post not found'}
        },
        description="Get list of comments for a specific post"
    )
    def get(self, request, post_id):
        # Check if post exists
        post = get_object_or_404(Post, id=post_id)
        
        # Get all comments for this post
        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=CommentCreateSerializer,
        responses={
            201: CommentSerializer,
            400: {'description': 'Validation errors'},
            401: {'description': 'Unauthorized'},
            404: {'description': 'Post not found'}
        },
        description="Create a new comment for a post"
    )
    def post(self, request, post_id):
        # Check if post exists
        post = get_object_or_404(Post, id=post_id)
        
        serializer = CommentCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create comment with current user as author
        comment = serializer.save(author=request.user, post=post)
        
        # Return full comment data
        response_serializer = CommentSerializer(comment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CommentDeleteView(APIView):
    """
    Delete user's own comment
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            204: {'description': 'Comment deleted successfully'},
            401: {'description': 'Unauthorized'},
            403: {'description': 'Forbidden - not the owner'},
            404: {'description': 'Comment not found'}
        },
        description="Delete user's own comment"
    )
    def delete(self, request, id):
        comment = get_object_or_404(Comment, id=id)
        
        # Check if user is the author
        if comment.author.id != request.user.id:
            return Response(
                {
                    "error": "You do not have permission to delete this comment",
                    "details": {}
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileDetailView(APIView):
    """
    Get user profile by ID
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: ProfileSerializer,
            401: {'description': 'Not authenticated'},
            404: {'description': 'User not found'}
        },
        description="Returns detailed information about a user profile including posts count"
    )
    def get(self, request, id):
        member = get_object_or_404(Member, id=id)
        serializer = ProfileSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileUpdateView(APIView):
    """
    Update own profile
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ProfileUpdateSerializer,
        responses={
            200: ProfileSerializer,
            400: {'description': 'Invalid input'},
            401: {'description': 'Not authenticated'}
        },
        description="Updates the authenticated user's profile information"
    )
    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        # Return full profile data
        response_serializer = ProfileSerializer(request.user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class ProfilePostsView(APIView):
    """
    Get posts by a specific user with pagination
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: PostSerializer(many=True),
            401: {'description': 'Not authenticated'},
            404: {'description': 'User not found'}
        },
        description="Returns paginated list of posts by a specific user"
    )
    def get(self, request, id):
        # Check if user exists
        member = get_object_or_404(Member, id=id)
        
        # Get all posts by this user
        posts = Post.objects.filter(author=member)
        
        # Apply pagination
        paginator = PostsPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        
        serializer = PostSerializer(paginated_posts, many=True)
        return paginator.get_paginated_response(serializer.data)
