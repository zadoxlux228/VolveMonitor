import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <span>VolveMonitor — клиентское приложение для учёта нефтедобычи</span>
      <span>Учебный проект · ASP.NET Core Web API + Angular</span>
    </footer>
  `,
  styles: [`
    .footer {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px 24px;
      background: #0d2b45;
      color: #9fb8cc;
      font-size: 13px;
    }
  `]
})
export class Footer {}