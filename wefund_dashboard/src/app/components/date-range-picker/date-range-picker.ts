import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePeriod } from '../../models/indicators.model';
import { format, subDays } from 'date-fns';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="date-picker-container glass-card">
      <div class="input-group">
        <label>From</label>
        <input type="date" [(ngModel)]="from" (change)="onDateChange()">
      </div>
      <div class="input-group">
        <label>To</label>
        <input type="date" [(ngModel)]="to" (change)="onDateChange()">
      </div>
    </div>
  `,
  styles: `
    .date-picker-container {
      display: flex;
      gap: 1.5rem;
      padding: 0.75rem 1.5rem;
      align-items: center;
      width: fit-content;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-main);
      padding: 0.4rem 0.6rem;
      font-family: inherit;
      font-size: 0.9rem;
      color-scheme: dark;
    }

    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-glow);
    }
  `
})
export class DateRangePickerComponent implements OnInit {
  from: string = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  to: string = format(new Date(), 'yyyy-MM-dd');

  @Output() periodChange = new EventEmitter<DatePeriod>();

  ngOnInit() {
    this.onDateChange();
  }

  onDateChange() {
    this.periodChange.emit({ from: this.from, to: this.to });
  }
}
