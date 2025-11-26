from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import Member
import secrets
from django.core.cache import cache


class CookieAuthentication(BaseAuthentication):
    """
    Custom authentication class that reads session_token from HttpOnly cookie
    """

    def authenticate(self, request):
        session_token = request.COOKIES.get('sessionid')
        
        if not session_token:
            return None
        
        # Get member_id from cache using session_token
        member_id = cache.get(f'session_{session_token}')
        
        if not member_id:
            return None
        
        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            raise AuthenticationFailed('User not found')
        
        return (member, None)


def create_session(member):
    """
    Create a session token for a member and store it in cache
    Returns the session token
    """
    session_token = secrets.token_urlsafe(32)
    # Store session for 30 days
    cache.set(f'session_{session_token}', member.id, timeout=30*24*60*60)
    return session_token


def delete_session(session_token):
    """
    Delete a session from cache
    """
    if session_token:
        cache.delete(f'session_{session_token}')
