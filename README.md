# Aerodyn Mobile

A professional delivery management mobile application built with React Native and Expo. The app provides a comprehensive solution for managing deliveries, tracking their status, and handling logistics operations efficiently.

![App Screenshot](assets/logo.png)

## Key Features

- 📦 Delivery Management
  - Create, edit, and delete deliveries
  - Track delivery status in real-time
  - Process/unprocess deliveries with full history
  - Attach media files and log files
  - Add collector information with validation

- 🗺️ Map Integration
  - Interactive map with delivery locations
  - Real-time tracking of pickup and delivery points
  - Visual representation of delivery routes
  - Distance calculation between points

- 🔐 Authentication & Security
  - Secure JWT-based authentication
  - Token-based session management
  - Automatic token refresh mechanism
  - Secure API communication

- 📱 Modern UI/UX
  - Material Design components
  - Dark theme optimized interface
  - Responsive and adaptive layouts
  - Native platform components
  - Smooth animations and transitions

## Tech Stack

- **Frontend Framework**: React Native with Expo
- **State Management**: MobX
- **UI Components**: React Native Paper
- **Maps**: React Native Maps
- **API Client**: Axios
- **Language**: TypeScript
- **Build Tool**: EAS (Expo Application Services)

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Physical Android/iOS device (optional)

## Project Structure

```
aerodyn_mobile/
├── src/
│   ├── api/          # API client and endpoints
│   ├── components/   # Reusable UI components
│   ├── navigation/   # Navigation configuration
│   ├── screens/      # Screen components
│   ├── store/        # MobX stores
│   ├── theme/        # Theme configuration
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   ├── constants/    # App constants
│   ├── hooks/        # Custom React hooks
│   └── services/     # Business logic services
├── assets/          # Static assets
└── docs/           # Documentation
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/aerodyn_mobile.git
cd aerodyn_mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure the backend URL:
Edit `src/api/client.ts` and update the `BASE_URL` constant:
```typescript
const BASE_URL = 'http://your-backend-url:8000';
```

## Running the App

### Development with Expo Go

1. Install Expo Go app:
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Start development server:
```bash
npx expo start
```

3. Connect:
   - Scan QR code with device camera (iOS) or Expo Go (Android)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

### Production APK Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure build:
```bash
eas build:configure
```

4. Build APK:
```bash
eas build -p android --profile preview
```

## Environment Setup

### Android Development
1. Install Android Studio
2. Install Android SDK
3. Configure environment variables:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### iOS Development (macOS only)
1. Install Xcode
2. Install CocoaPods
3. Configure iOS project:
```bash
cd ios && pod install
```

## API Configuration

The app communicates with a REST API. Configure the base URL in `src/api/client.ts`:

```typescript
const BASE_URL = process.env.API_URL || 'http://localhost:8000';
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Document complex logic
- Use consistent naming conventions

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

## Deployment

1. Update version in app.json
2. Build for production:
```bash
eas build --platform all --profile production
```

## Support

For support, email support@aerodyn.com or join our Slack channel.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native community
- Expo team
- All contributors 