# Bingo Mobile App — CLAUDE.md

## Project Overview

Health Bingo React Native app for iOS and Android. Users track wellness challenges on bingo cards, earn points and badges, and compete on leaderboards.

**React Native**: 0.78.0 | **React**: 19.0.0 | **Language**: TypeScript

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | React Native 0.78 |
| Navigation | @react-navigation (bottom tabs + native stack) |
| State | Zustand 5 |
| Payments | @stripe/stripe-react-native |
| Auth | @react-native-google-signin/google-signin |
| Push Notifications | @react-native-firebase/messaging |
| Forms | Custom hooks + local state |
| Icons | react-native-vector-icons |
| Image Picker | react-native-image-picker |
| Time | moment-timezone |
| Audio | react-native-sound |

## Commands

```bash
npm start            # Metro bundler
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS simulator
npm run lint         # ESLint
npm test             # Jest
```

## Behavioral Foundation
```
- Don't assume. Don't hide confusion. Surface tradeoffs.
- Minimum code that solves the problem. Nothing speculative.
- Touch only what you must. Clean up only your own mess.
- Define success criteria. Loop until verified.
```

## Project Structure

```
src/
├── assets/          # Images, fonts
├── components/      # Reusable UI components (shared across screens)
├── constants/       # API base URL, Stripe keys, Google client IDs, timezone
├── hooks/           # Custom hooks (useFCM, useNotifications, useChallengeUpdates)
├── navigation/      # AppNavigator — stack and tab configuration
├── provider/        # React context providers (ToastProvider)
├── screens/         # Full-page screen components, grouped by domain
├── services/        # API call wrappers, sound service
├── store/           # Zustand stores (11 stores, one per domain)
├── theme/           # Color palette, typography, spacing constants
├── types/           # TypeScript type definitions
├── utils/           # Pure utility functions
├── App.tsx          # Root component — providers, navigation container
└── index.js         # RN entry point
```

## Code Style & Conventions

### File Naming
- Screens: PascalCase in a domain folder (e.g., `screens/dashboard/ChallengesList.tsx`)
- Components: PascalCase (e.g., `BingoCard.tsx`, `AvatarPicker.tsx`)
- Stores: camelCase with `Store` suffix (e.g., `authStore.ts`, `challengeStore.ts`)
- Hooks: `use<Name>.ts` (e.g., `useAuth.ts`, `useFCM.ts`)
- Services: camelCase (e.g., `soundService.ts`)
- Types: `types/<domain>.ts`

### TypeScript
- `React.FC` for functional component type annotation
- All props typed with explicit interfaces — no inline `any`
- Path alias `@/` maps to `src/` — always use it for imports across directories
- Enums for status/role values; plain union types for simple variants

### Naming
- Variables/functions: camelCase
- Constants (non-primitive): UPPER_SNAKE_CASE
- Components/Screens/Types: PascalCase

### State Management (Zustand)
- One store per domain — keep stores focused
- Use `persist` middleware with `AsyncStorage` for auth and user stores
- Selectors: destructure only what the component needs — avoid subscribing to the whole store
- Mutations live inside the store (`set` calls) — no direct state mutation from components

### Styling
- Use the `theme/` constants for colors, fonts, and spacing — no hardcoded hex values
- StyleSheet.create for component styles (performance)
- Avoid inline styles except for truly dynamic values (e.g., animated transforms)

### Navigation
- Type-safe navigation using `@react-navigation` typed param lists
- Define screen param types in `navigation/` alongside the navigator
- Use `useNavigation` and `useRoute` hooks — do not pass `navigation` as a prop

### API Calls
- All network requests go through service functions in `services/`
- Base URL comes from `constants/config.ts` — never hardcode API URLs elsewhere
- Handle loading and error states in the calling component or store action

### Components
- Keep screen components thin — extract logic into hooks or store actions
- Reusable UI lives in `components/` — if used in 2+ screens, move it out
- Prefer controlled components for inputs

## Key Domain Areas

- **Auth**: Google Sign-In, JWT token storage, refresh flow
- **Bingo Cards**: grid display, challenge completion, card state
- **Challenges**: listing, filtering, completion tracking
- **Points & Badges**: earned rewards display, leaderboard
- **Notifications**: FCM push notification setup and handling
- **Payments**: Stripe subscription purchase flow
- **Profile**: avatar upload, user settings

## Constants & Config

All environment-specific values are in `src/constants/config.ts`:
- `API_BASE_URL`
- `STRIPE_PUBLISHABLE_KEY`
- `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID`
- `DEFAULT_TIMEZONE`
