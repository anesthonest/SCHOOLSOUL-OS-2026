/**
 * SchoolSoul Production Environment & Configuration Validator
 * Validates runtime configuration for Render Web Service & Cloud Deployment
 */

export interface SystemConfigReport {
  nodeEnv: string;
  port: number;
  isProduction: boolean;
  isValid: boolean;
  databaseType: 'PostgreSQL' | 'LocalPersistentStore';
  databaseConfigured: boolean;
  appUrl: string;
  isHttps: boolean;
  jwtConfigured: boolean;
  pesapal: {
    environment: 'sandbox' | 'production';
    baseUrl: string;
    consumerKeyConfigured: boolean;
    consumerSecretConfigured: boolean;
    ipnConfigured: boolean;
    ipnIdMasked: string;
    paymentsEnabled: boolean;
    status: 'READY' | 'SANDBOX_CONFIG_REQUIRED' | 'PRODUCTION_CONFIG_REQUIRED' | 'IPN_REGISTRATION_REQUIRED' | 'DISABLED';
  };
  mtn: {
    environment: 'sandbox' | 'production';
    subscriptionKeyConfigured: boolean;
    apiUserConfigured: boolean;
    apiKeyConfigured: boolean;
    paymentsEnabled: boolean;
    status: 'READY' | 'SANDBOX_CONFIG_REQUIRED' | 'PRODUCTION_CONFIG_REQUIRED' | 'DISABLED';
  };
  airtel: {
    environment: 'sandbox' | 'production';
    clientIdConfigured: boolean;
    clientSecretConfigured: boolean;
    paymentsEnabled: boolean;
    status: 'READY' | 'SANDBOX_CONFIG_REQUIRED' | 'PRODUCTION_CONFIG_REQUIRED' | 'DISABLED';
  };
  flutterwave: {
    environment: 'sandbox' | 'production';
    secretKeyConfigured: boolean;
    publicKeyConfigured: boolean;
    webhookHashConfigured: boolean;
    paymentsEnabled: boolean;
    status: 'READY' | 'SANDBOX_CONFIG_REQUIRED' | 'PRODUCTION_CONFIG_REQUIRED' | 'DISABLED';
  };
  warnings: string[];
  errors: string[];
}

export function validateEnvironment(): SystemConfigReport {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const port = Number(process.env.PORT) || 3000;
  const rawAppUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
  const isHttps = rawAppUrl.startsWith('https://');

  const databaseUrl = process.env.DATABASE_URL;
  const databaseType = (databaseUrl && databaseUrl.startsWith('postgres')) ? 'PostgreSQL' : 'LocalPersistentStore';
  const databaseConfigured = Boolean(databaseUrl || !isProduction);

  const jwtSecret = process.env.JWT_SECRET;
  const isDefaultJwtSecret = !jwtSecret || jwtSecret === 'schoolsoul-master-secret-key-2026';
  const jwtConfigured = Boolean(jwtSecret && !isDefaultJwtSecret);

  // Pesapal configuration
  const pesapalEnv = (process.env.PESAPAL_ENVIRONMENT?.toLowerCase() === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production';
  const pesapalBaseUrl = pesapalEnv === 'production' ? 'https://pay.pesapal.com/v3' : 'https://cybqa.pesapal.com/pesapalv3';
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY || '';
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || '';
  const ipnId = process.env.PESAPAL_IPN_ID || '';
  const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true' || process.env.PESAPAL_PAYMENTS_ENABLED === 'true';

  // MTN Mobile Money configuration
  const mtnEnv = (process.env.MTN_MOMO_ENVIRONMENT?.toLowerCase() === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production';
  const mtnSubKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY || '';
  const mtnApiUser = process.env.MTN_MOMO_API_USER || '';
  const mtnApiKey = process.env.MTN_MOMO_API_KEY || '';
  const mtnPaymentsEnabled = process.env.MTN_MOMO_ENABLED === 'true' || process.env.MTN_PAYMENTS_ENABLED === 'true' || paymentsEnabled;

  let mtnStatus: SystemConfigReport['mtn']['status'] = 'DISABLED';
  if (!mtnSubKey || !mtnApiUser || !mtnApiKey) {
    mtnStatus = mtnEnv === 'production' ? 'PRODUCTION_CONFIG_REQUIRED' : 'SANDBOX_CONFIG_REQUIRED';
  } else if (mtnPaymentsEnabled) {
    mtnStatus = 'READY';
  } else {
    mtnStatus = 'DISABLED';
  }

  // Airtel Money configuration
  const airtelEnv = (process.env.AIRTEL_MONEY_ENVIRONMENT?.toLowerCase() === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production';
  const airtelClientId = process.env.AIRTEL_MONEY_CLIENT_ID || '';
  const airtelClientSecret = process.env.AIRTEL_MONEY_CLIENT_SECRET || '';
  const airtelPaymentsEnabled = process.env.AIRTEL_MONEY_ENABLED === 'true' || process.env.AIRTEL_PAYMENTS_ENABLED === 'true' || paymentsEnabled;

  let airtelStatus: SystemConfigReport['airtel']['status'] = 'DISABLED';
  if (!airtelClientId || !airtelClientSecret) {
    airtelStatus = airtelEnv === 'production' ? 'PRODUCTION_CONFIG_REQUIRED' : 'SANDBOX_CONFIG_REQUIRED';
  } else if (airtelPaymentsEnabled) {
    airtelStatus = 'READY';
  } else {
    airtelStatus = 'DISABLED';
  }

  // Flutterwave configuration (Registered Provider Abstraction - Disabled for Production Release)
  const flwEnv = (process.env.FLW_ENVIRONMENT?.toLowerCase() === 'production' || process.env.FLUTTERWAVE_ENVIRONMENT?.toLowerCase() === 'production') ? 'production' : 'sandbox';
  const flwSecret = process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || '';
  const flwPublic = process.env.FLW_PUBLIC_KEY || process.env.FLUTTERWAVE_PUBLIC_KEY || '';
  const flwHash = process.env.FLW_WEBHOOK_HASH || process.env.FLUTTERWAVE_SECRET_HASH || '';
  const flwPaymentsEnabled = process.env.FLW_PAYMENTS_ENABLED === 'true' || process.env.FLUTTERWAVE_PAYMENTS_ENABLED === 'true';

  const warnings: string[] = [];
  const errors: string[] = [];

  if (isProduction) {
    if (!isHttps) {
      warnings.push('APP_URL should use HTTPS in production for secure payment callbacks and webhooks.');
    }
    if (isDefaultJwtSecret) {
      warnings.push('JWT_SECRET is using default fallback. Provide a high-entropy secret in Render environment variables.');
    }
    if (databaseType === 'LocalPersistentStore') {
      warnings.push('DATABASE_URL not detected. Ensure Render PostgreSQL or persistent disk is configured for durable multi-instance data persistence.');
    }
  }

  // Determine Pesapal Status (Primary & Required Payment Gateway)
  let pesapalStatus: SystemConfigReport['pesapal']['status'] = 'DISABLED';
  if (!consumerKey || !consumerSecret) {
    pesapalStatus = pesapalEnv === 'production' ? 'PRODUCTION_CONFIG_REQUIRED' : 'SANDBOX_CONFIG_REQUIRED';
  } else if (!ipnId) {
    pesapalStatus = 'IPN_REGISTRATION_REQUIRED';
  } else if (paymentsEnabled) {
    pesapalStatus = 'READY';
  } else {
    pesapalStatus = 'DISABLED';
  }

  // Flutterwave Status (Explicitly DISABLED for Current Release - Not a blocker or dependency)
  const flwStatus: SystemConfigReport['flutterwave']['status'] = 'DISABLED';

  const maskedIpnId = ipnId ? (ipnId.length > 8 ? `${ipnId.substring(0, 4)}...${ipnId.substring(ipnId.length - 4)}` : '****') : 'NOT_CONFIGURED';

  return {
    nodeEnv,
    port,
    isProduction,
    isValid: errors.length === 0,
    databaseType,
    databaseConfigured,
    appUrl: rawAppUrl,
    isHttps,
    jwtConfigured,
    pesapal: {
      environment: pesapalEnv,
      baseUrl: pesapalBaseUrl,
      consumerKeyConfigured: Boolean(consumerKey),
      consumerSecretConfigured: Boolean(consumerSecret),
      ipnConfigured: Boolean(ipnId),
      ipnIdMasked: maskedIpnId,
      paymentsEnabled,
      status: pesapalStatus,
    },
    mtn: {
      environment: mtnEnv,
      subscriptionKeyConfigured: Boolean(mtnSubKey),
      apiUserConfigured: Boolean(mtnApiUser),
      apiKeyConfigured: Boolean(mtnApiKey),
      paymentsEnabled: mtnPaymentsEnabled,
      status: mtnStatus,
    },
    airtel: {
      environment: airtelEnv,
      clientIdConfigured: Boolean(airtelClientId),
      clientSecretConfigured: Boolean(airtelClientSecret),
      paymentsEnabled: airtelPaymentsEnabled,
      status: airtelStatus,
    },
    flutterwave: {
      environment: flwEnv,
      secretKeyConfigured: Boolean(flwSecret),
      publicKeyConfigured: Boolean(flwPublic),
      webhookHashConfigured: Boolean(flwHash),
      paymentsEnabled: false,
      status: flwStatus,
    },
    warnings,
    errors,
  };
}

export function logSystemStartupBanner(report: SystemConfigReport): void {
  console.log('============================================================');
  console.log('🏫 SCHOOLSOUL SECURE CLOUD OPERATING SYSTEM');
  console.log('============================================================');
  console.log(`• Environment : ${report.nodeEnv.toUpperCase()}`);
  console.log(`• Binding Port: ${report.port}`);
  console.log(`• Database    : ${report.databaseType} (${report.databaseConfigured ? 'READY' : 'LOCAL STORE'})`);
  console.log(`• App URL     : ${report.appUrl} [${report.isHttps ? 'HTTPS SECURE' : 'HTTP/DEV'}]`);
  console.log(`• JWT Security: ${report.jwtConfigured ? 'CUSTOM HIGH-ENTROPY' : 'STANDARD DEFAULT'}`);
  console.log(`• Pesapal 3.0 : [${report.pesapal.environment.toUpperCase()}] Status: ${report.pesapal.status}`);
  console.log(`• MTN MoMo    : [${report.mtn.environment.toUpperCase()}] Status: ${report.mtn.status}`);
  console.log(`• Airtel Money: [${report.airtel.environment.toUpperCase()}] Status: ${report.airtel.status}`);
  console.log(`• Flutterwave : DISABLED / NOT REQUIRED (Pesapal + MoMo Primary Release)`);
  console.log(`• Gateway Mode: Multi-Rail (MTN Mobile Money, Airtel Money, Pesapal)`);
  if (report.warnings.length > 0) {
    console.log('------------------------------------------------------------');
    console.log('⚠️  DEPLOYMENT NOTICES:');
    report.warnings.forEach((w) => console.log(`   - ${w}`));
  }
  console.log('============================================================');
}
