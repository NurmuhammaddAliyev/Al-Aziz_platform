from django.contrib.auth import get_user_model
from rest_framework import serializers

from subjects.models import Subject

from .models import ClassGroup, CourseEnrollment, StudentProfile


User = get_user_model()


class ClassGroupSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    student_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClassGroup
        fields = ['id', 'name', 'grade_level', 'teacher', 'teacher_name', 'student_count', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at', 'teacher_name', 'student_count']

    def get_teacher_name(self, obj):
        if obj.teacher:
            return obj.teacher.get_full_name() or obj.teacher.username
        return None


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    class_group = ClassGroupSerializer(read_only=True)
    class_group_id = serializers.PrimaryKeyRelatedField(
        source='class_group',
        queryset=ClassGroup.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'class_group',
            'class_group_id',
            'class_name',
            'phone',
            'photo',
            'joined_at',
            'is_active',
        ]
        read_only_fields = ['id', 'joined_at']


class StudentCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    class_name = serializers.CharField(max_length=50)
    class_group_id = serializers.IntegerField(required=False, allow_null=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        password = validated_data.pop('password')
        class_name = validated_data.pop('class_name')
        class_group_id = validated_data.pop('class_group_id', None)
        phone = validated_data.pop('phone', '')
        photo = validated_data.pop('photo', None)

        user = User.objects.create_user(password=password, role=User.Role.STUDENT, **validated_data)

        profile, _ = StudentProfile.objects.get_or_create(user=user)
        profile.class_name = class_name
        profile.phone = phone
        if class_group_id:
            profile.class_group = ClassGroup.objects.filter(pk=class_group_id).first()
            if profile.class_group:
                profile.class_name = profile.class_group.name
        if photo is not None:
            profile.photo = photo
        profile.save()
        return profile


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    subject_name = serializers.SerializerMethodField(read_only=True)
    class_name = serializers.SerializerMethodField(read_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.filter(is_active=True))

    class Meta:
        model = CourseEnrollment
        fields = [
            'id',
            'student',
            'student_name',
            'phone',
            'subject',
            'subject_name',
            'class_name',
            'status',
            'note',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'student', 'student_name', 'subject_name', 'class_name', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username

    def get_subject_name(self, obj):
        return obj.subject.name

    def get_class_name(self, obj):
        return obj.student.display_class_name

    def validate(self, data):
        """Subject faol bo'lishi kerakligini tekshir"""
        subject = data.get('subject')
        if subject and not subject.is_active:
            raise serializers.ValidationError('Bu kurs aktiv emas.')
        return data

    def create(self, validated_data):
        """Yangi enrollment yaratish - student avtomatik qo'shiladi"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError('Autentifikatsiya talab qilinadi.')

        student_profile = StudentProfile.objects.filter(user=request.user).first()
        if not student_profile:
            raise serializers.ValidationError('O\'quvchi profili topilmadi.')

        subject = validated_data['subject']
        
        # Agar allaqachon ro'yxatdan o'tgan bo'lsa, eski recordni foydalanish
        enrollment, created = CourseEnrollment.objects.get_or_create(
            student=student_profile,
            subject=subject,
            defaults={
                'phone': validated_data.get('phone') or student_profile.phone or '',
                'status': CourseEnrollment.Status.PENDING,
                'note': validated_data.get('note', ''),
            },
        )
        
        if not created:
            # Eski recordni yangilash
            enrollment.phone = validated_data.get('phone') or student_profile.phone or ''
            enrollment.note = validated_data.get('note', '')
            enrollment.save()
        
        return enrollment
