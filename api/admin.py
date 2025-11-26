from django.contrib import admin
from .models import Member, Post, Comment


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'created_at']
    search_fields = ['username', 'email']
    readonly_fields = ['created_at']
    list_filter = ['created_at']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'content_preview', 'created_at', 'updated_at']
    search_fields = ['content', 'author__username']
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    raw_id_fields = ['author']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post', 'content_preview', 'created_at']
    search_fields = ['content', 'author__username']
    readonly_fields = ['created_at']
    list_filter = ['created_at']
    raw_id_fields = ['author', 'post']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
