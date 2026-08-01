/**
 * PoultryCockpit - Immutable Audit Engine
 * Business Engine Audit Event Recorder
 */

import { AuditLogRecord, UserRole } from '../types';

export interface LogEventParams {
  eventId: string;
  eventType: string;
  entity: string;
  entityId: string;
  actionPerformed: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  userId: string;
  userRole: UserRole;
  sourceModule: string;
}

export const AuditEngine = {
  createAuditRecord(params: LogEventParams): AuditLogRecord {
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'aud-' + Date.now(),
      event_id: params.eventId,
      event_type: params.eventType,
      entity: params.entity,
      entity_id: params.entityId,
      action_performed: params.actionPerformed,
      previous_value: params.previousValue || null,
      new_value: params.newValue || null,
      user_id: params.userId,
      user_role: params.userRole,
      ip_address: '127.0.0.1',
      source_module: params.sourceModule,
      timestamp: new Date().toISOString(),
    };
  }
};
