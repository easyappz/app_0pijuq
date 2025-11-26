from rest_framework import serializers
from api.models import Member, Post, Comment


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model - displays user data"""
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(max_length=254, required=True)
    password = serializers.CharField(min_length=8, max_length=128, required=True, write_only=True)
    password_confirm = serializers.CharField(min_length=8, max_length=128, required=True, write_only=True)

    def validate_username(self, value):
        """Check if username already exists"""
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with this username already exists")
        return value

    def validate_email(self, value):
        """Check if email already exists"""
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate(self, data):
        """Check if passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Passwords do not match"
            })
        return data

    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        member = Member(
            username=validated_data['username'],
            email=validated_data['email']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model - displays post data"""
    author = MemberSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a post"""
    class Meta:
        model = Post
        fields = ['content']

    def validate_content(self, value):
        """Validate content length"""
        if len(value) > 5000:
            raise serializers.ValidationError("Content is too long (max 5000 characters)")
        return value


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model - displays comment data"""
    author = MemberSerializer(read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'post_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'post_id', 'created_at', 'updated_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a comment"""
    class Meta:
        model = Comment
        fields = ['content']

    def validate_content(self, value):
        """Validate content length"""
        if len(value) > 2000:
            raise serializers.ValidationError("Content is too long (max 2000 characters)")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with posts count"""
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['id', 'username', 'bio', 'avatar_url', 'posts_count', 'created_at']
        read_only_fields = ['id', 'username', 'posts_count', 'created_at']

    def get_posts_count(self, obj):
        """Get the count of posts by this user"""
        return obj.posts.count()


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = Member
        fields = ['bio']

    def validate_bio(self, value):
        """Validate bio length"""
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio must not exceed 500 characters")
        return value


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)
