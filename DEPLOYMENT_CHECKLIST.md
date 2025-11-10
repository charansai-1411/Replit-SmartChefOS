# 🚀 Firebase Deployment Checklist

Complete checklist for deploying SmartChefOS Firebase authentication to production.

## Pre-Deployment

### 1. Firebase Project Setup

- [ ] Firebase project created
- [ ] Project name matches environment (dev/staging/prod)
- [ ] Billing enabled (Blaze plan for Cloud Functions)
- [ ] Team members added with appropriate roles

### 2. Firebase Services Enabled

- [ ] Authentication → Email/Password enabled
- [ ] Realtime Database created
- [ ] Cloud Storage enabled
- [ ] Cloud Functions enabled
- [ ] (Optional) Phone authentication enabled

### 3. Environment Configuration

- [ ] `.firebaserc` updated with correct project ID
- [ ] `.env` file created with all required variables
- [ ] `serviceAccountKey.json` downloaded and secured
- [ ] Environment variables validated (no placeholders)
- [ ] Service account key NOT in git (check `.gitignore`)

### 4. Dependencies Installed

```bash
# Root project
npm install

# Cloud Functions
cd functions && npm install && cd ..
```

- [ ] Root dependencies installed
- [ ] Functions dependencies installed
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Versions compatible (Node 18+)

### 5. Code Review

- [ ] All TypeScript compiles without errors
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Input validation in place
- [ ] Rate limiting considered
- [ ] Security best practices followed

## Deployment Steps

### 1. Build Cloud Functions

```bash
npm run functions:build
```

- [ ] TypeScript compilation successful
- [ ] No build errors
- [ ] `functions/lib/` directory created
- [ ] All functions exported correctly

### 2. Deploy Security Rules

```bash
firebase deploy --only database
```

- [ ] Database rules deployed successfully
- [ ] Rules match expected structure
- [ ] Test rules in Firebase Console

```bash
firebase deploy --only storage
```

- [ ] Storage rules deployed successfully
- [ ] File size limits configured
- [ ] Content type restrictions in place

### 3. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

- [ ] All 7 functions deployed:
  - [ ] `createRestaurant`
  - [ ] `inviteStaff`
  - [ ] `acceptInvite`
  - [ ] `updateUserRole`
  - [ ] `updateRestaurantProfile`
  - [ ] `deactivateUser`
  - [ ] `revokeInvite`
- [ ] No deployment errors
- [ ] Functions visible in Firebase Console
- [ ] Function logs accessible

### 4. Verify Deployment

#### Test in Firebase Console

- [ ] **Authentication**
  - [ ] Email/Password provider enabled
  - [ ] Can create test user

- [ ] **Realtime Database**
  - [ ] Rules deployed (check timestamp)
  - [ ] Can view data structure
  - [ ] Rules simulator works

- [ ] **Cloud Functions**
  - [ ] All functions listed
  - [ ] Function URLs accessible
  - [ ] Logs showing activity

- [ ] **Storage**
  - [ ] Rules deployed
  - [ ] Bucket accessible
  - [ ] Upload restrictions work

## Post-Deployment Testing

### 1. Smoke Tests

#### Test Signup Flow

```bash
# Use Postman or curl to test
curl -X POST https://your-region-your-project.cloudfunctions.net/createRestaurant \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Restaurant","country":"IN","currency":"INR","timezone":"Asia/Kolkata"}'
```

- [ ] Signup creates user in Authentication
- [ ] Restaurant created in database
- [ ] Custom claims set correctly
- [ ] User can log in
- [ ] Token refresh works

#### Test Staff Invite Flow

- [ ] Admin can create invite
- [ ] Invite token stored in database
- [ ] Invite link generated
- [ ] Staff can accept invite
- [ ] Staff linked to restaurant
- [ ] Custom claims updated

#### Test Security Rules

- [ ] User can read own data
- [ ] User cannot read other user data
- [ ] Restaurant member can read restaurant data
- [ ] Non-member cannot read restaurant data
- [ ] Admin can write restaurant data
- [ ] Non-admin cannot write restaurant data

### 2. Integration Tests

- [ ] Complete signup → restaurant creation flow
- [ ] Complete invite → accept flow
- [ ] Role change flow
- [ ] User deactivation flow
- [ ] Invite revocation flow

### 3. Performance Tests

- [ ] Function cold start time acceptable (< 5s)
- [ ] Database queries fast (< 500ms)
- [ ] Token refresh works
- [ ] No memory leaks
- [ ] No timeout errors

## Security Verification

### 1. Authentication Security

- [ ] Password requirements enforced
- [ ] Email verification (if enabled)
- [ ] Password reset works
- [ ] Account lockout after failed attempts (if configured)
- [ ] No weak passwords accepted

### 2. Authorization Security

- [ ] Custom claims set correctly
- [ ] Claims include restaurantId and role
- [ ] Claims refresh on role change
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected

### 3. Database Security

- [ ] Multi-tenant isolation enforced
- [ ] No cross-tenant data access
- [ ] Admin-only operations protected
- [ ] Sensitive paths not readable by clients
- [ ] Write-once protection on slugs

### 4. Function Security

- [ ] All inputs validated
- [ ] SQL injection prevented (N/A for Realtime DB)
- [ ] XSS prevented (sanitization)
- [ ] CSRF protection (Firebase handles)
- [ ] Rate limiting (consider implementing)

### 5. Storage Security

- [ ] File size limits enforced
- [ ] Content type validation
- [ ] Admin-only uploads
- [ ] Tenant-only reads
- [ ] No public access

## Monitoring Setup

### 1. Firebase Console

- [ ] **Authentication** dashboard monitored
- [ ] **Realtime Database** usage tracked
- [ ] **Cloud Functions** logs reviewed
- [ ] **Storage** usage monitored

### 2. Alerts Configured

- [ ] High error rate alert
- [ ] Function timeout alert
- [ ] Database quota alert
- [ ] Storage quota alert
- [ ] Unusual activity alert

### 3. Logging

- [ ] Function logs enabled
- [ ] Error logging configured
- [ ] Audit logging for admin actions (implement if needed)
- [ ] Log retention policy set

## Backup & Recovery

### 1. Database Backups

- [ ] Automated backups enabled in Firebase Console
- [ ] Backup frequency configured (daily recommended)
- [ ] Backup retention policy set
- [ ] Restore procedure documented
- [ ] Backup tested (restore to test environment)

### 2. Disaster Recovery Plan

- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined
- [ ] Failover procedure documented
- [ ] Team trained on recovery process

## Documentation

### 1. Internal Documentation

- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Security rules explained
- [ ] Troubleshooting guide created

### 2. User Documentation

- [ ] Signup instructions
- [ ] Staff invite process
- [ ] Role management guide
- [ ] FAQ created
- [ ] Support contact provided

## External Integrations

### 1. Email Service (Optional)

- [ ] SendGrid/Mailgun configured
- [ ] Email templates created
- [ ] Invite emails working
- [ ] Password reset emails working
- [ ] Email delivery monitored

### 2. SMS Service (Optional)

- [ ] Twilio configured
- [ ] SMS templates created
- [ ] Phone invites working
- [ ] OTP delivery working
- [ ] SMS costs monitored

### 3. Analytics (Optional)

- [ ] Google Analytics configured
- [ ] Custom events tracked
- [ ] User journeys monitored
- [ ] Conversion funnels set up

## Performance Optimization

### 1. Database

- [ ] Indexes created for common queries
- [ ] Denormalization applied where needed
- [ ] Shallow queries used for lists
- [ ] Pagination implemented

### 2. Functions

- [ ] Cold start optimization
- [ ] Minimal dependencies
- [ ] Connection pooling (if needed)
- [ ] Caching implemented (if needed)

### 3. Client

- [ ] Token caching
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Image optimization

## Compliance & Legal

### 1. Data Privacy

- [ ] GDPR compliance (if EU users)
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Cookie consent (if needed)
- [ ] Data retention policy

### 2. Security Compliance

- [ ] Security audit completed
- [ ] Penetration testing (if required)
- [ ] Vulnerability scan
- [ ] Compliance certifications (if needed)

## Go-Live

### 1. Pre-Launch

- [ ] All tests passed
- [ ] Security verified
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Team trained
- [ ] Support ready

### 2. Launch

- [ ] DNS configured (if custom domain)
- [ ] SSL certificate valid
- [ ] Redirect old URLs (if applicable)
- [ ] Announce to users
- [ ] Monitor closely for 24h

### 3. Post-Launch

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address issues promptly
- [ ] Document lessons learned

## Rollback Plan

### 1. Rollback Triggers

- [ ] High error rate (> 5%)
- [ ] Critical security issue
- [ ] Data corruption
- [ ] Service unavailable
- [ ] User complaints spike

### 2. Rollback Procedure

```bash
# Rollback functions
firebase deploy --only functions --version PREVIOUS_VERSION

# Rollback rules
firebase deploy --only database,storage --version PREVIOUS_VERSION
```

- [ ] Rollback procedure documented
- [ ] Team trained on rollback
- [ ] Rollback tested in staging
- [ ] Communication plan for rollback

## Maintenance

### 1. Regular Tasks

- [ ] **Daily**: Monitor logs and errors
- [ ] **Weekly**: Review usage metrics
- [ ] **Monthly**: Security audit
- [ ] **Quarterly**: Dependency updates
- [ ] **Annually**: Full security review

### 2. Updates

- [ ] Node.js version updates
- [ ] Firebase SDK updates
- [ ] Dependency updates
- [ ] Security patches
- [ ] Feature enhancements

## Cost Management

### 1. Firebase Pricing

- [ ] Blaze plan enabled
- [ ] Budget alerts configured
- [ ] Usage monitored
- [ ] Cost optimization applied
- [ ] Forecast reviewed monthly

### 2. Cost Optimization

- [ ] Unused resources removed
- [ ] Function execution optimized
- [ ] Database queries optimized
- [ ] Storage cleanup automated
- [ ] Caching implemented

## Success Metrics

### 1. Technical Metrics

- [ ] Uptime > 99.9%
- [ ] Function success rate > 99%
- [ ] Average response time < 500ms
- [ ] Error rate < 1%
- [ ] Zero security incidents

### 2. Business Metrics

- [ ] User signup rate
- [ ] Restaurant creation rate
- [ ] Staff invite acceptance rate
- [ ] User retention
- [ ] Feature adoption

## Sign-Off

### Deployment Approval

- [ ] **Developer**: Code reviewed and tested
- [ ] **Tech Lead**: Architecture approved
- [ ] **Security**: Security audit passed
- [ ] **Product**: Features verified
- [ ] **Management**: Go-live approved

### Post-Deployment Verification

- [ ] **Developer**: All tests passed
- [ ] **Tech Lead**: Monitoring active
- [ ] **Security**: No vulnerabilities detected
- [ ] **Product**: User experience validated
- [ ] **Management**: Success metrics met

---

## Quick Reference

### Essential Commands

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only database
firebase deploy --only storage
firebase deploy --only functions

# View logs
firebase functions:log

# Test locally
firebase emulators:start
```

### Emergency Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Team Lead**: [contact]
- **On-Call Engineer**: [contact]
- **Security Team**: [contact]

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Environment**: ☐ Development ☐ Staging ☐ Production

**Status**: ☐ In Progress ☐ Completed ☐ Rolled Back

**Notes**:
_______________________________________
_______________________________________
_______________________________________
