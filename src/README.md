# Badminton Manager

A comprehensive badminton group management application built with React and Supabase.

## Features

- **Authentication System**: Secure login/signup with role-based access
- **Group Management**: Create and manage badminton groups
- **Player Registration**: Register players with skill levels and payment tracking
- **Court Management**: Add/remove courts with availability tracking
- **Match System**: Auto-generate matches with intelligent algorithms
- **Real-time Timer**: Track match duration with live timers
- **Reports & Analytics**: Comprehensive player statistics and game history
- **Admin Panel**: User management and system monitoring

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions, PostgreSQL
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (recommended)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd badminton-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_PROJECT_ID=ragbicjnfhsaosyhonzi
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Troubleshooting

**Environment Variable Error**
If you see `Cannot read properties of undefined (reading 'VITE_SUPABASE_PROJECT_ID')`:
1. Ensure your `.env` file exists in the root directory
2. Restart your development server after creating/modifying `.env`
3. Verify environment variable names start with `VITE_`
4. Run `npm run setup` to automatically configure environment variables
5. If the error persists, the app will fall back to hardcoded values

**Build Error: Expected "(" but found "!=="**
This error occurs due to syntax issues in the configuration file:
1. Ensure your TypeScript configuration is correct
2. Restart your development server
3. Run `npm run test-config` to verify configuration

**TypeScript Errors**
If you encounter TypeScript-related errors:
1. Ensure all `.tsx` files have proper imports
2. Check that `tsconfig.json` is configured correctly
3. Restart your IDE/editor after configuration changes

### Deployment

#### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_ANON_KEY`

#### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

#### Other Hosting Options

- **Cloudflare Pages**: Connect your Git repository
- **GitHub Pages**: Use GitHub Actions for deployment
- **AWS S3 + CloudFront**: For scalable hosting

## Configuration

### Supabase Setup

1. Create a new Supabase project
2. The application uses a KV store abstraction layer
3. Edge Functions are automatically deployed
4. Configure authentication settings in Supabase dashboard

### Environment Variables

```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

## Usage

### Admin Features

- Create and manage groups
- View user analytics
- System monitoring
- User management

### Player Features

- Join groups
- Register for sessions
- View personal statistics
- Track game history

### Match Management

- Auto-generate optimal matches
- Manual match creation
- Real-time match timers
- Court availability tracking

## Architecture

```
Frontend (React) → Supabase Edge Functions → PostgreSQL Database
                ↓
            Supabase Auth Service
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact [your-email] or create an issue in the repository.