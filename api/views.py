from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from .serializers import (
    MessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer
)
from .models import Member
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
