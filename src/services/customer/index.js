/**
 * Customer Services Module
 * Centralized export for all customer-facing services
 * 
 * Usage:
 * import { customerKotService, customerOrderService, customerMenuService, customerSessionService } from '@/services/customer';
 * 
 * or
 * 
 * import { createCustomerKot } from '@/services/customer/customerKotService';
 */

export { default as customerKotService } from './customerKotService';
export { default as customerOrderService } from './customerOrderService';
export { default as customerMenuService } from './customerMenuService';
export { default as customerSessionService } from './customerSessionService';

// Named exports for convenience
export * from './customerKotService';
export * from './customerOrderService';
export * from './customerMenuService';
export * from './customerSessionService';

