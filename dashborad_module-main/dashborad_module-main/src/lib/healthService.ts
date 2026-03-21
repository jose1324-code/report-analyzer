// Re-exports from firestoreService — healthMetrics now live under userProfiles/{uid}/healthMetrics
export type { DailyMetrics } from './firestoreService'
export { addHealthMetric, getHealthMetrics, deleteHealthMetric } from './firestoreService'
