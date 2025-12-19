/**
 * Inngest Module - Event-driven functions for Wildout Project
 *
 * This module provides event-driven functionality using Inngest for:
 * - User registration workflows
 * - Event creation processing
 * - Audit logging
 * - Email notifications
 * - Batch processing
 */

export { inngest, inngestClient } from './client';
export type { WildoutEvents } from './client';

export {
  sendWelcomeEmail,
  processNewEvent,
  processAuditLog,
  batchEmailProcessor,
  inngestFunctions,
} from './functions';

export {
  enhancedAuditLogger,
  userRegistrationWorkflow,
  eventCreationWorkflow,
  maintenanceWorkflow,
  inngestIntegrations,
} from './integrations';

export { inngestHandler } from './server';

export {
  handleInngestRequest,
  createInngestExpressRoute,
  inngestNextRouteHandler,
  createInngestHonoRoute,
} from './api';

export {
  useInngest,
  useUserRegistration,
  useEventCreation,
  useAuditLog,
  useEmail,
} from './hooks';