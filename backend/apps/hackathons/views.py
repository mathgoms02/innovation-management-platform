from rest_framework import viewsets
from .models import Hackathon
from .serializers import HackathonSerializer
from .permissions import IsAdminOrReadOnly

class HackathonViewSet(viewsets.ModelViewSet):
    queryset = Hackathon.objects.all()
    serializer_class = HackathonSerializer
    permission_classes = [IsAdminOrReadOnly]
