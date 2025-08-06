# Campus Navigator Frontend

A mobile-friendly Next.js frontend for the Campus Navigation API.

## Features

- 📱 **Mobile-First Design**: Optimized for smartphones and tablets
- 🧭 **Turn-by-Turn Navigation**: Clear, step-by-step directions
- 🚀 **PWA Support**: Installable as a mobile app
- ⚡ **Fast & Responsive**: Built with Next.js and Tailwind CSS
- 🎨 **Modern UI**: Clean, intuitive interface with icons and animations

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Connection

The frontend connects to the FastAPI backend running on `http://localhost:8000`. 

Make sure your backend server is running:
```bash
# In the backend directory
python get_route.py
```

## Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Mobile Features

### Progressive Web App (PWA)
- Installable on mobile devices
- Works offline (basic functionality)
- App-like experience with custom splash screen

### Mobile Optimizations
- Touch-friendly buttons and inputs
- Responsive layout that adapts to all screen sizes
- Optimized viewport settings
- Fast loading with Next.js optimizations

### Mobile Testing
1. Open Chrome DevTools
2. Toggle device toolbar (mobile view)
3. Test with different device sizes
4. Use lighthouse to audit mobile performance

## Components

- **RouteForm**: Input form for start/end coordinates
- **RouteResult**: Display route information and turn-by-turn directions
- **Types**: TypeScript definitions for route data

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Any static hosting service**

## Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"

## API Integration

The app calls these backend endpoints:

- `GET /` - Health check
- `GET /route` - Get navigation route

Example API call:
```javascript
const response = await fetch(
  `${API_URL}/route?start_lat=28.525237&start_lng=77.570965&end_lat=28.525503&end_lng=77.575042`
);
```

## Troubleshooting

### Backend Connection Issues
- Ensure backend server is running on port 8000
- Check CORS settings in backend
- Verify environment variables

### Mobile Issues
- Clear browser cache
- Check network connectivity
- Ensure proper viewport meta tags

### Build Issues
- Delete `.next` folder and rebuild
- Check for TypeScript errors
- Verify all dependencies are installed

## Browser Support

- ✅ Chrome (mobile & desktop)
- ✅ Safari (mobile & desktop)
- ✅ Firefox (mobile & desktop)
- ✅ Edge (mobile & desktop)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile devices
5. Submit a pull request
