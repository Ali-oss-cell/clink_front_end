# Image Size Guide for Homepage Slider

## 📐 Recommended Image Sizes

### **Desktop (1024px and above)**
- **Width**: 1920px (Full HD)
- **Height**: 1080px (16:9 aspect ratio) or 1200px (taller for hero)
- **Aspect Ratio**: 16:9 or 21:9 (widescreen)
- **File Size**: 200-500 KB (optimized)
- **Format**: WebP (best) or JPG (fallback)

### **Tablet (768px - 1023px)**
- **Width**: 1200px
- **Height**: 800px
- **Aspect Ratio**: 3:2 or 16:10
- **File Size**: 150-300 KB
- **Format**: WebP or JPG

### **Mobile (below 768px)**
- **Width**: 800px
- **Height**: 1200px (portrait) or 600px (landscape)
- **Aspect Ratio**: 2:3 (portrait) or 4:3 (landscape)
- **File Size**: 100-200 KB
- **Format**: WebP or JPG

---

## 🎯 Optimal Dimensions for Slider

### **Primary Recommendation (Responsive)**
```
Desktop:  1920 x 1080px (16:9)
Tablet:   1200 x 800px  (3:2)
Mobile:   800 x 1200px  (2:3 portrait)
```

### **Alternative (Square-ish)**
```
Desktop:  1920 x 1200px (8:5)
Tablet:   1200 x 900px  (4:3)
Mobile:   800 x 1000px  (4:5)
```

---

## 📊 File Size Guidelines

### **Maximum File Sizes (Optimized)**
- **Desktop**: 500 KB max
- **Tablet**: 300 KB max
- **Mobile**: 200 KB max

### **Target File Sizes (Ideal)**
- **Desktop**: 200-300 KB
- **Tablet**: 150-200 KB
- **Mobile**: 100-150 KB

**Why?** Faster page load = better user experience and SEO

---

## 🖼️ Image Format Recommendations

### **1. WebP (Best Choice)**
- ✅ 25-35% smaller than JPG
- ✅ Better quality at same file size
- ✅ Supports transparency
- ⚠️ Not supported in older browsers (use fallback)

### **2. JPG (Universal)**
- ✅ Supported everywhere
- ✅ Good for photos
- ❌ No transparency
- ❌ Larger file size

### **3. PNG (Avoid for backgrounds)**
- ✅ Supports transparency
- ❌ Much larger file size
- ❌ Not ideal for photos

---

## 🎨 Image Content Guidelines

### **What to Include in Images:**
- ✅ Calming, professional scenes
- ✅ People in professional settings (with permission)
- ✅ Nature scenes (calming)
- ✅ Abstract patterns
- ✅ Medical/healthcare imagery (professional)

### **What to Avoid:**
- ❌ Busy, distracting backgrounds
- ❌ Text-heavy images (text should be in HTML)
- ❌ Low-quality or pixelated images
- ❌ Images that compete with text readability

---

## 💻 How to Use Images in the Slider

### **Option 1: Single Image (Responsive)**
```typescript
const slides: Slide[] = [
  {
    id: 1,
    title: 'Professional Psychology Services',
    subtitle: 'Your subtitle here...',
    backgroundImage: '/images/hero-slide-1.jpg', // Single image for all devices
    // ... rest of slide config
  }
];
```

### **Option 2: Different Images for Mobile/Desktop**
```typescript
const slides: Slide[] = [
  {
    id: 1,
    title: 'Professional Psychology Services',
    subtitle: 'Your subtitle here...',
    backgroundImage: '/images/hero-slide-1-desktop.jpg', // Desktop
    backgroundImageMobile: '/images/hero-slide-1-mobile.jpg', // Mobile
    // ... rest of slide config
  }
];
```

### **Option 3: Gradient Only (No Image)**
```typescript
const slides: Slide[] = [
  {
    id: 1,
    title: 'Professional Psychology Services',
    subtitle: 'Your subtitle here...',
    gradient: 'linear-gradient(135deg, #2c5aa0 0%, #1e3d72 100%)',
    // No backgroundImage - uses gradient
  }
];
```

---

## 📁 Where to Place Images

### **Recommended Folder Structure:**
```
public/
  images/
    hero/
      slide-1-desktop.webp
      slide-1-desktop.jpg (fallback)
      slide-1-mobile.webp
      slide-1-mobile.jpg (fallback)
      slide-2-desktop.webp
      slide-2-desktop.jpg
      ...
```

### **Access in Code:**
```typescript
backgroundImage: '/images/hero/slide-1-desktop.webp'
```

---

## 🛠️ Image Optimization Tools

### **Online Tools:**
1. **Squoosh** (https://squoosh.app/) - Google's image optimizer
2. **TinyPNG** (https://tinypng.com/) - Compress images
3. **ImageOptim** - Desktop app for Mac
4. **GIMP** - Free image editor

### **Command Line:**
```bash
# Using ImageMagick
convert input.jpg -quality 85 -resize 1920x1080 output.jpg

# Using cwebp (WebP converter)
cwebp -q 80 input.jpg -o output.webp
```

---

## ✅ Quick Checklist

Before adding images to your slider:

- [ ] Image is at least 1920px wide for desktop
- [ ] File size is under 500 KB (optimized)
- [ ] Image is in WebP or JPG format
- [ ] Image has good contrast for text overlay
- [ ] Image is professional and relevant
- [ ] Mobile version is optimized (if using separate image)
- [ ] Image is placed in `/public/images/hero/` folder
- [ ] Fallback JPG version exists (if using WebP)

---

## 🎯 Example Image Specifications

### **Slide 1: Professional Services**
- **Desktop**: 1920 x 1080px, 250 KB, WebP
- **Mobile**: 800 x 1200px, 150 KB, WebP
- **Content**: Professional office or calm nature scene

### **Slide 2: Telehealth**
- **Desktop**: 1920 x 1080px, 280 KB, WebP
- **Mobile**: 800 x 1200px, 160 KB, WebP
- **Content**: Person on video call or technology imagery

### **Slide 3: In-Person Care**
- **Desktop**: 1920 x 1080px, 300 KB, WebP
- **Mobile**: 800 x 1200px, 170 KB, WebP
- **Content**: Clinic interior or healthcare setting

### **Slide 4: Medicare**
- **Desktop**: 1920 x 1080px, 240 KB, WebP
- **Mobile**: 800 x 1200px, 140 KB, WebP
- **Content**: Trustworthy, professional imagery

---

## 📱 Responsive Image Strategy

### **Method 1: CSS Background Images (Current Implementation)**
- Uses `background-size: cover` for responsive scaling
- Single image scales to fit all screen sizes
- Simpler but less optimal for mobile

### **Method 2: Picture Element (Future Enhancement)**
```html
<picture>
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  <source media="(min-width: 1024px)" srcset="desktop.jpg">
  <img src="desktop.jpg" alt="Hero image">
</picture>
```
- Serves different images for different screen sizes
- Better performance (smaller files on mobile)
- More complex implementation

---

## 🚀 Performance Tips

1. **Lazy Load**: Images load as slides become active
2. **Preload**: Preload first slide image
3. **Compression**: Always compress images before upload
4. **Format**: Use WebP with JPG fallback
5. **CDN**: Consider using a CDN for faster delivery

---

## 📝 Notes

- The slider currently has a **minimum height of 600px**
- Images will be **centered and cover the entire slide area**
- A **dark overlay** is automatically applied for text readability
- Images should have **good contrast** for white text overlay
- Consider **accessibility** - ensure text is readable over images

