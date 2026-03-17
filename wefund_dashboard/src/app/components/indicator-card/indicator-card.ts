import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indicator-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card indicator-container">
      <div class="header">
        <h3>{{ title }}</h3>
        <span class="info-icon">ⓘ</span>
      </div>
      
      <div class="content" [class.loading]="loading">
        <ng-content></ng-content>
        
        <div *ngIf="loading" class="loader-overlay">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .indicator-container {
      padding: 1.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-main);
      margin: 0;
    }

    .info-icon {
      color: var(--text-muted);
      cursor: help;
      font-size: 0.9rem;
    }

    .content {
      flex: 1;
      position: relative;
      min-height: 200px;
    }

    .content.loading {
      opacity: 0.5;
    }

    .loader-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(56, 189, 248, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
})
export class IndicatorCardComponent {
  @Input() title: string = '';
  @Input() loading: boolean = false;
}
