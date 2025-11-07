# Patient Resources API Endpoints

## Overview
Endpoints for managing and accessing mental health resources, educational materials, and self-help tools.

---

## 1. Get All Resources
**Endpoint:** `GET /api/resources/`

**Description:** Retrieve a paginated list of mental health resources.

**Query Parameters:**
- `category` (optional): Filter by category (anxiety, depression, stress, sleep, mindfulness, relationships, self-care, grief)
- `type` (optional): Filter by type (article, video, audio, guide, worksheet)
- `search` (optional): Search resources by title or description
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Results per page (default: 20)

**Response:**
```json
{
  "count": 50,
  "next": "http://api.example.com/api/resources/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Understanding Anxiety",
      "description": "Learn about anxiety disorders, symptoms, and coping strategies.",
      "category": "anxiety",
      "type": "article",
      "icon": "😰",
      "duration_minutes": 10,
      "difficulty_level": "beginner",
      "view_count": 1520,
      "is_bookmarked": false,
      "thumbnail_url": "https://example.com/thumbnails/anxiety-101.jpg",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T15:30:00Z"
    }
  ]
}
```

---

## 2. Get Single Resource
**Endpoint:** `GET /api/resources/{id}/`

**Description:** Retrieve detailed information about a specific resource including full content.

**Response:**
```json
{
  "id": 1,
  "title": "Understanding Anxiety",
  "description": "Comprehensive guide to understanding and managing anxiety disorders.",
  "category": "anxiety",
  "type": "article",
  "icon": "😰",
  "duration_minutes": 10,
  "difficulty_level": "beginner",
  "content": "<h2>What is Anxiety?</h2><p>Anxiety is a normal emotion...</p>",
  "content_type": "html",  // or "markdown", "video_url", "audio_url", "pdf_url"
  "media_url": null,  // For video/audio resources
  "download_url": null,  // For downloadable PDFs/worksheets
  "author": "Dr. Sarah Johnson",
  "reviewer": "Dr. Michael Chen",
  "last_reviewed_date": "2024-01-20",
  "tags": ["anxiety", "mental-health", "coping-strategies", "beginners"],
  "view_count": 1520,
  "average_rating": 4.7,
  "total_ratings": 234,
  "is_bookmarked": false,
  "user_progress": 0,  // 0-100 for videos/audio
  "estimated_reading_time": "10 minutes",
  "references": [
    {
      "title": "American Psychological Association - Anxiety",
      "url": "https://www.apa.org/topics/anxiety"
    }
  ],
  "related_resources": [
    {
      "id": 5,
      "title": "Breathing Exercises for Anxiety",
      "type": "video",
      "thumbnail_url": "https://example.com/thumbnails/breathing.jpg"
    }
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T15:30:00Z"
}
```

---

## 3. Get Resource Categories
**Endpoint:** `GET /api/resources/categories/`

**Description:** Get list of available resource categories with counts.

**Response:**
```json
[
  {
    "id": "anxiety",
    "name": "Anxiety",
    "icon": "😰",
    "description": "Resources for managing anxiety and worry",
    "resource_count": 24
  },
  {
    "id": "depression",
    "name": "Depression",
    "icon": "💙",
    "description": "Understanding and coping with depression",
    "resource_count": 18
  }
]
```

---

## 4. Bookmark Resource
**Endpoint:** `POST /api/resources/{id}/bookmark/`

**Description:** Add or remove resource from user's bookmarks.

**Request Body:**
```json
{
  "action": "add"  // or "remove"
}
```

**Response:**
```json
{
  "message": "Resource bookmarked successfully",
  "is_bookmarked": true
}
```

---

## 5. Track Resource View
**Endpoint:** `POST /api/resources/{id}/track-view/`

**Description:** Track when a user views a resource (for analytics).

**Response:**
```json
{
  "message": "View tracked",
  "total_views": 1521
}
```

---

## 6. Update Progress
**Endpoint:** `POST /api/resources/{id}/progress/`

**Description:** Update user's progress on video/audio resources.

**Request Body:**
```json
{
  "progress_percentage": 45,  // 0-100
  "current_time_seconds": 180
}
```

**Response:**
```json
{
  "message": "Progress updated",
  "progress_percentage": 45,
  "is_completed": false
}
```

---

## 7. Rate Resource
**Endpoint:** `POST /api/resources/{id}/rate/`

**Description:** Submit a rating for a resource.

**Request Body:**
```json
{
  "rating": 5,  // 1-5
  "review": "Very helpful resource!"  // optional
}
```

**Response:**
```json
{
  "message": "Rating submitted successfully",
  "average_rating": 4.7,
  "total_ratings": 235
}
```

---

## 8. Get User Bookmarks
**Endpoint:** `GET /api/resources/bookmarks/`

**Description:** Get all resources bookmarked by the current user.

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "Understanding Anxiety",
      "category": "anxiety",
      "type": "article",
      "bookmarked_at": "2024-01-20T10:30:00Z"
    }
  ]
}
```

---

## 9. Get User History
**Endpoint:** `GET /api/resources/history/`

**Description:** Get resources recently viewed by the user.

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "Understanding Anxiety",
      "category": "anxiety",
      "type": "article",
      "viewed_at": "2024-01-20T14:20:00Z",
      "progress_percentage": 100
    }
  ]
}
```

---

## 10. Search Resources
**Endpoint:** `GET /api/resources/search/`

**Description:** Advanced search with multiple filters.

**Query Parameters:**
- `q`: Search query
- `categories[]`: Array of categories
- `types[]`: Array of types
- `difficulty`: beginner, intermediate, advanced
- `min_duration`: Minimum duration in minutes
- `max_duration`: Maximum duration in minutes

**Response:**
```json
{
  "count": 15,
  "results": [
    // Array of resources matching criteria
  ]
}
```

---

## Data Models

### Resource Types:
- `article` - Text-based article
- `video` - Video content
- `audio` - Audio/meditation
- `guide` - Step-by-step guide
- `worksheet` - Downloadable worksheet/PDF
- `quiz` - Interactive assessment
- `infographic` - Visual infographic

### Categories:
- `anxiety` - Anxiety management
- `depression` - Depression support
- `stress` - Stress management
- `sleep` - Sleep improvement
- `mindfulness` - Mindfulness & meditation
- `relationships` - Relationship health
- `self-care` - Self-care practices
- `grief` - Grief & loss support
- `trauma` - Trauma recovery
- `addiction` - Addiction support

### Difficulty Levels:
- `beginner` - Easy to understand, basic concepts
- `intermediate` - More detailed information
- `advanced` - In-depth, clinical information

