import { Injectable, signal } from '@angular/core';

export type ModalType = 'location' | 'partner-meet' | 'analytics' | 'meeting-detail' | 'location-history' | null;

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = signal<ModalState>({
    isOpen: false,
    type: null,
    data: null
  });

  // Public readonly signal
  public readonly modal = this.modalState.asReadonly();

  openModal(type: ModalType, data?: any) {
    this.modalState.set({
      isOpen: true,
      type,
      data
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modalState.set({
      isOpen: false,
      type: null,
      data: null
    });
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  isModalOpen(type?: ModalType): boolean {
    const state = this.modalState();
    if (type) {
      return state.isOpen && state.type === type;
    }
    return state.isOpen;
  }

  getModalData<T = any>(): T | null {
    return this.modalState().data || null;
  }
}
