/**
 * Voice Event Bus
 *
 * A typed, synchronous event emitter for voice commands.
 * Enables any component on any page to listen for and respond to voice events.
 *
 * @module voice-events
 */

export type VoiceEventType =
  | "navigate" // Go to a page
  | "patient:open" // Open a specific patient
  | "patient:tab" // Switch tab within Patient 360
  | "patient:actions" // Show priority actions for patient (from home)
  | "actions:complete" // Let AI handle actions
  | "calendar:reschedule" // Reschedule appointment
  | "session:start" // Start session with patient
  | "session:end" // End session
  | "go:home"; // Return to home

export interface VoiceEvent {
  type: VoiceEventType;
  payload: Record<string, string>;
  transcript: string; // Original transcript for debugging
}

type VoiceEventHandler = (event: VoiceEvent) => void;

class VoiceEventBus {
  private listeners: Map<VoiceEventType | "*", Set<VoiceEventHandler>> = new Map();

  /**
   * Subscribe to a specific event type or all events ('*')
   * @returns Unsubscribe function
   */
  on(type: VoiceEventType | "*", handler: VoiceEventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  /**
   * Emit an event to all subscribed handlers
   */
  emit(event: VoiceEvent): void {
    // Fire specific listeners
    this.listeners.get(event.type)?.forEach((fn) => fn(event));
    // Fire wildcard listeners
    this.listeners.get("*")?.forEach((fn) => fn(event));
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const voiceEvents = new VoiceEventBus();
