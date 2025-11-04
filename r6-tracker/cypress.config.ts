import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    
    // Configuration du viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Retry
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Video
    video: true,
    videoCompression: 32,
    
    // Screenshots
    screenshotOnRunFailure: true,
    
    // Security and cookies
    chromeWebSecurity: false,
    modifyObstructiveCode: false,
    
    setupNodeEvents(on, config) {
      // Charger les variables d'environnement depuis .env.local
      require('dotenv').config({ path: '.env.local' });
      
      // Passer les variables d'environnement importantes à Cypress
      config.env = {
        ...config.env,
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      };
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.{cy,spec}.{js,jsx,ts,tsx}',
  },
});
