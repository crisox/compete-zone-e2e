# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CompeteZone E2E is a comprehensive end-to-end testing suite for the CompeteZone application using Playwright. It validates the complete flow from UI to database, simulating real user scenarios across multiple browsers and devices.

## Architecture

This is a Docker-based E2E testing environment that orchestrates:
- **Frontend**: React + Vite application (port 5173)
- **Backend**: Spring Boot API (port 8082)
- **Database**: PostgreSQL (port 5435)
- **Test Runner**: Playwright with multi-browser support
- **Monitoring**: Dozzle for real-time log viewing

The test structure follows Page Object Model pattern organized by feature areas:
- `tests/e2e/auth/` - Authentication flows (login, register, recovery)
- `tests/e2e/events/` - Event management and registration
- `tests/e2e/gyms/` - Gym operations and reviews
- `tests/e2e/athletes/` - Athlete profile management
- `tests/api/` - Direct API testing
- `tests/ui/` - UI component testing

## Common Development Commands

### Environment Setup
```bash
# Install dependencies and browsers
npm install
npm run install:browsers

# Configure environment
cp .env.example .env
# Edit .env with your local configuration

# Start all services for testing
npm run setup:services
npm run wait:services
npm run seed:data
```

### Test Execution
```bash
# Run complete E2E suite (recommended for full validation)
npm run test:e2e

# Run specific test categories
npm run test:auth        # Authentication tests only
npm run test:events      # Event management tests
npm run test:gyms        # Gym operations tests
npm run test:api         # API tests only
npm run test:ui          # UI component tests

# Performance-oriented test runs
npm run test:fast        # 8 workers, 30s timeout
npm run test:aggressive  # 12 workers, 20s timeout, list reporter
npm run test:ultra       # Auto-detects CPU cores, up to 16 workers

# Debugging modes
npm run test:debug       # Headed mode with debugger
npm run test:trace       # With trace enabled
npm run test:ui-mode     # Interactive UI mode
```

### Service Management
```bash
# Start services with real-time logs
npm run dev:with-logs

# Monitor logs
npm run logs:services    # Docker container logs
npm run logs:playwright  # Playwright execution logs
npm run logs:dozzle      # Open Dozzle web interface (http://localhost:8086)

# Clean up
npm run teardown:services    # Stop and remove containers
npm run clean:data          # Clear test data
```

### Data and Fixtures
```bash
# Regenerate test data
npm run fixtures:generate
npm run fixtures:validate

# Database operations
npm run seed:data    # Load test fixtures
npm run debug        # Check service status
```

## Test Configuration

### Performance Optimization
The suite is configured for aggressive parallelization:
- **Development**: 8 workers by default
- **CI**: 1 worker (configured via `process.env.CI`)
- **Ultra Mode**: Auto-detects CPU cores (up to 16 workers)
- **Timeouts**: 15-30s depending on test type
- **Browser**: Headless by default, optimized Chrome flags

### Browser Support
Tests run across multiple browsers/devices:
- Chrome (with aggressive performance flags)
- Firefox
- Safari (WebKit)
- Mobile Chrome (Pixel 5 emulation)
- Mobile Safari (iPhone 12 emulation)
- Tablet (iPad emulation)

### Test Data Management
- **Fixtures**: JSON files in `fixtures/` directory
- **Database**: PostgreSQL with automatic seeding
- **Test Users**: Pre-configured accounts with consistent IDs
- **Isolation**: Each test run gets clean data state

## Development Patterns

### Test Structure
```javascript
// Standard test pattern
test.describe('Feature Area', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange: Setup test state
    await page.goto('/some-page');

    // Act: Perform user action
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Assert: Verify outcome
    await expect(page).toHaveURL('/expected-destination');
  });
});
```

### Database Operations
Use the utility functions in `utils/database.js`:
```javascript
const { getUserByEmail, executeQuery } = require('../utils/database');

// Check if test user exists
const user = await getUserByEmail('test@example.com');

// Execute custom queries
const result = await executeQuery('SELECT * FROM events WHERE gym_id = $1', [gymId]);
```

### Service Waiting
The test suite automatically waits for services via global setup, but individual tests can use:
```javascript
const { waitForServices } = require('../utils/wait-for-services');
await waitForServices(); // Wait for API, DB, and Frontend
```

## Environment Variables

Key environment variables in `.env`:
- `API_URL` - Backend API URL (default: http://localhost:8082)
- `FRONTEND_URL` - Frontend URL (default: http://localhost:5173)
- `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` - Database connection
- `TEST_ADMIN_EMAIL`, `TEST_ATHLETE_EMAIL`, `TEST_GYM_EMAIL` - Test user accounts

## Troubleshooting

### Common Issues
1. **Port conflicts**: Services use non-standard ports (5173, 8082, 5435) to avoid conflicts
2. **Database connection**: Ensure PostgreSQL container is healthy before running tests
3. **Browser installation**: Run `npm run install:browsers` if Playwright browsers are missing
4. **Test flakiness**: Use `npm run test:debug` to run tests headed for debugging

### Debugging Tools
- **Dozzle**: Real-time log monitoring at http://localhost:8086
- **Playwright Reports**: HTML reports in `playwright-report/`
- **Test Results**: Artifacts in `test-results/`
- **Database**: Connect directly to PostgreSQL on port 5435 for data inspection

## Performance Notes

This test suite is optimized for speed:
- Tests run in parallel with up to 16 workers
- Browser optimizations disable unnecessary features
- Videos and traces are disabled by default for performance
- Database uses connection pooling and optimized queries
- Docker services are configured for minimal resource usage

For development, use `npm run test:fast` for quick feedback. For CI/CD, use `npm run test:ci` with JUnit reporting.